import * as Linking from 'expo-linking';

import { solve } from '../game/solverValidator';
import { mockAdService } from '../services/ads/adService';
import { useGameStore } from '../store/gameStore';

/**
 * Development-only deep links for QA and screenshots without touching the screen, e.g.
 *   xcrun simctl openurl booted "exp://127.0.0.1:8081/--/dev?level=40&taps=c0,c3"
 * Params: ad=claim|close (finish the mock ad on screen), reset=1, coins=N, unlock=N, level=N, screen=menu|levelSelect|settings|howToPlay,
 * taps=c0,c1,... (one every 450 ms), action=hint|undo|extraPrism|pause|solve|pay|double|skip|next|restart.
 * Never registered in production builds.
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const handle = async (url: string) => {
  const { queryParams } = Linking.parse(url);
  if (!queryParams) return;
  const q = (key: string) => {
    const v = queryParams[key];
    return typeof v === 'string' ? v : undefined;
  };
  const store = useGameStore.getState;

  if (q('ad')) {
    mockAdService?.finishCurrent(q('ad') === 'claim');
    return;
  }
  if (q('reset')) await store().resetProgress();
  if (q('coins') || q('unlock')) {
    const p = store().progress;
    useGameStore.setState({
      progress: {
        ...p,
        coins: q('coins') ? Number(q('coins')) : p.coins,
        unlockedLevel: q('unlock') ? Number(q('unlock')) : p.unlockedLevel,
        completedLevels: q('unlock')
          ? Array.from({ length: Number(q('unlock')) - 1 }, (_, i) => i + 1)
          : p.completedLevels,
        tutorialCompleted: q('unlock') ? Number(q('unlock')) > 3 : p.tutorialCompleted,
        gamesPlayed: Math.max(1, p.gamesPlayed),
      },
    });
  }
  if (q('level')) store().startLevel(Number(q('level')));
  const screen = q('screen');
  if (screen === 'menu') store().backToMenu();
  else if (screen === 'levelSelect' || screen === 'settings' || screen === 'howToPlay') {
    store().navigate(screen);
  }
  for (const id of q('taps')?.split(',') ?? []) {
    store().tapContainer(id);
    await sleep(450);
  }
  switch (q('action')) {
    case 'hint':
    case 'undo':
    case 'extraPrism':
      store().requestAction(q('action') as 'hint' | 'undo' | 'extraPrism');
      break;
    case 'pause':
      store().openPause();
      break;
    case 'pay':
      store().payWithCoins();
      break;
    case 'double':
      void store().doubleCoins();
      break;
    case 'skip':
      void store().skipLevel();
      break;
    case 'next':
      void store().goToNextLevel();
      break;
    case 'restart':
      void store().restartLevel();
      break;
    case 'solve': {
      const level = store().level;
      if (!level) break;
      for (const move of solve(level.containers).moves) {
        store().tapContainer(move.sourceId);
        store().tapContainer(move.targetId);
      }
      break;
    }
  }
};

export const registerDevLinks = () => {
  if (!__DEV__) return () => undefined;
  const sub = Linking.addEventListener('url', ({ url }) => void handle(url));
  return () => sub.remove();
};
