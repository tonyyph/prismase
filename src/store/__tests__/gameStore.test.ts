import AsyncStorage from '@react-native-async-storage/async-storage';

import { COSTS, REWARDS } from '../../game/economy';
import { solve } from '../../game/solverValidator';
import { adService } from '../../services/ads/adService';
import { STORAGE_KEYS } from '../../services/storage/storageKeys';
import { useGameStore } from '../gameStore';

const initial = useGameStore.getState();
let now = 1_000_000;

const store = () => useGameStore.getState();

const winCurrentLevel = () => {
  const level = store().level!;
  for (const move of solve(level.containers).moves) {
    store().tapContainer(move.sourceId);
    store().tapContainer(move.targetId);
  }
};

const stored = async (key: string) => JSON.parse((await AsyncStorage.getItem(key)) ?? 'null');

beforeEach(async () => {
  await AsyncStorage.clear();
  useGameStore.setState(initial, true);
  now = 1_000_000;
  jest.spyOn(Date, 'now').mockImplementation(() => now);
  await store().boot();
});

afterEach(() => jest.restoreAllMocks());

it('boots into the menu with default progress', () => {
  expect(store().status).toBe('menu');
  expect(store().progress.currentLevel).toBe(1);
});

it('plays level 1 to completion, rewards and unlocks, and survives a restart of the app', async () => {
  store().continueGame();
  expect(store().status).toBe('playing');
  winCurrentLevel();
  expect(store().status).toBe('levelComplete');
  expect(store().lastWin).toMatchObject({
    level: 1,
    coinsEarned: REWARDS.newLevel,
    firstClear: true,
  });
  expect(store().progress).toMatchObject({
    unlockedLevel: 2,
    currentLevel: 2,
    completedLevels: [1],
  });

  const coins = store().progress.coins;
  useGameStore.setState(initial, true);
  await store().boot();
  expect(store().progress).toMatchObject({ coins, unlockedLevel: 2, completedLevels: [1] });
});

it('doubles coins once through a rewarded ad', async () => {
  store().startLevel(1);
  winCurrentLevel();
  const before = store().progress.coins;
  await store().doubleCoins();
  expect(store().progress.coins).toBe(before + REWARDS.newLevel);
  expect(store().lastWin?.doubled).toBe(true);
  await store().doubleCoins();
  expect(store().progress.coins).toBe(before + REWARDS.newLevel);
  expect((await stored(STORAGE_KEYS.progress)).coins).toBe(before + REWARDS.newLevel);
});

it('grants nothing when the rewarded ad is not finished', async () => {
  jest.spyOn(adService, 'showRewarded').mockResolvedValue(false);
  store().startLevel(1);
  winCurrentLevel();
  const before = store().progress.coins;
  await store().doubleCoins();
  expect(store().progress.coins).toBe(before);
});

describe('interstitial pacing through real play', () => {
  const playAndContinue = async () => {
    winCurrentLevel();
    await store().goToNextLevel();
  };

  it('stays silent for levels 1-5, then follows the 3-win and 90-second rules', async () => {
    const show = jest.spyOn(adService, 'showInterstitial');
    store().startLevel(1);
    for (let i = 0; i < 5; i += 1) {
      await playAndContinue();
      now += 120_000;
    }
    expect(show).not.toHaveBeenCalled();

    await playAndContinue(); // level 6, six wins since the last ad
    expect(show).toHaveBeenCalledTimes(1);
    expect(show).toHaveBeenLastCalledWith('level_complete_interstitial');

    now += 120_000;
    await playAndContinue(); // 7
    await playAndContinue(); // 8
    expect(show).toHaveBeenCalledTimes(1);
    now += 10_000;
    await playAndContinue(); // 9: three wins and 130 seconds since the last ad
    expect(show).toHaveBeenCalledTimes(2);

    await playAndContinue(); // 10
    await playAndContinue(); // 11
    await playAndContinue(); // 12: three wins but under 90 seconds
    expect(show).toHaveBeenCalledTimes(2);
    expect(store().level?.level).toBe(13);
  });

  it('skips the interstitial right after a rewarded ad', async () => {
    const show = jest.spyOn(adService, 'showInterstitial');
    useGameStore.setState({ progress: { ...store().progress, unlockedLevel: 20 } });
    store().startLevel(10);
    winCurrentLevel();
    await store().doubleCoins();
    now += 30_000;
    await store().goToNextLevel();
    expect(show).not.toHaveBeenCalled();
  });
});

describe('paid actions', () => {
  beforeEach(() => {
    useGameStore.setState({ progress: { ...store().progress, unlockedLevel: 40, coins: 50 } });
    store().startLevel(30);
  });

  it('uses free undos first, then asks for coins or an ad', async () => {
    const first = store().level!;
    const move = solve(first.containers).moves[0];
    for (let i = 0; i < 4; i += 1) {
      store().tapContainer(move.sourceId);
      store().tapContainer(move.targetId);
      store().requestAction('undo');
    }
    expect(store().level?.freeUndosLeft).toBe(0);
    expect(store().purchase).toBe('undo');
    store().payWithCoins();
    expect(store().progress.coins).toBe(50 - COSTS.undo);
    expect(store().level?.moveHistory).toHaveLength(0);
  });

  it('a hint with no free quota opens the purchase sheet and an ad pays for it', async () => {
    store().requestAction('hint');
    expect(store().purchase).toBe('hint');
    await store().payWithAd();
    expect(store().purchase).toBeNull();
    expect(store().level?.hint).toBeDefined();
    expect(store().progress.coins).toBe(50);
  });

  it('cannot buy what it cannot afford', () => {
    useGameStore.setState({ progress: { ...store().progress, coins: 10 } });
    store().requestAction('extraPrism');
    store().payWithCoins();
    expect(store().level?.extraPrismUsed).toBe(false);
    expect(store().progress.coins).toBe(10);
  });

  it('extra prism adds one container once', () => {
    const count = store().level!.containers.length;
    store().requestAction('extraPrism');
    store().payWithCoins();
    expect(store().level!.containers).toHaveLength(count + 1);
    store().requestAction('extraPrism');
    expect(store().purchase).toBeNull();
    expect(store().level!.containers).toHaveLength(count + 1);
  });

  it('skip level needs a rewarded ad and unlocks the next level', async () => {
    await store().skipLevel();
    expect(store().level?.level).toBe(31);
    expect(store().progress.completedLevels).toContain(30);
  });

  it('restart resets the board and quotas', async () => {
    const level = store().level!;
    const move = solve(level.containers).moves[0];
    store().tapContainer(move.sourceId);
    store().tapContainer(move.targetId);
    store().requestAction('undo');
    await store().restartLevel();
    expect(store().level?.containers).toEqual(level.initialContainers);
    expect(store().level?.freeUndosLeft).toBe(3);
  });
});

it('saves settings across launches', async () => {
  store().updateSettings({ soundEnabled: false, reducedMotion: true });
  useGameStore.setState(initial, true);
  await store().boot();
  expect(store().settings).toMatchObject({
    soundEnabled: false,
    reducedMotion: true,
    hapticsEnabled: true,
  });
});

it('reset progress returns to level 1', async () => {
  store().startLevel(1);
  winCurrentLevel();
  await store().resetProgress();
  expect(store().progress.unlockedLevel).toBe(1);
  expect(await stored(STORAGE_KEYS.progress)).toMatchObject({ unlockedLevel: 1 });
});

it('survives corrupted storage', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  await AsyncStorage.setItem(STORAGE_KEYS.progress, '{not json');
  useGameStore.setState(initial, true);
  await store().boot();
  expect(store().status).toBe('menu');
  expect(store().progress.currentLevel).toBe(1);
});
