import { useGameStore } from '../store/gameStore';

const actions = () => {
  const s = useGameStore.getState();
  return {
    selectContainer: s.tapContainer,
    requestAction: s.requestAction,
    undoMove: () => s.requestAction('undo'),
    useHint: () => s.requestAction('hint'),
    addExtraPrism: () => s.requestAction('extraPrism'),
    restartLevel: s.restartLevel,
    skipLevel: s.skipLevel,
    goToNextLevel: s.goToNextLevel,
    replayLevel: s.replayLevel,
    continueGame: s.continueGame,
    startLevel: s.startLevel,
    doubleCoins: s.doubleCoins,
    openPause: s.openPause,
    resumeGame: s.resumeGame,
    backToMenu: s.backToMenu,
    navigate: s.navigate,
    goBack: s.goBack,
  };
};

let cached: ReturnType<typeof actions> | null = null;

/**
 * The game actions from the brief, in one place, for screens to call. Store actions never
 * change identity, so this object is built once and is safe to use in dependency arrays.
 */
export const usePrismaseGame = () => (cached ??= actions());
