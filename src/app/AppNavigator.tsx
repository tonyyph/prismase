import { useEffect } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useReducedMotion } from '../hooks/usePersistedSettings';
import { BootScreen } from '../screens/BootScreen';
import { GameScreen } from '../screens/GameScreen';
import { HowToPlayScreen } from '../screens/HowToPlayScreen';
import { LevelSelectScreen } from '../screens/LevelSelectScreen';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useGameStore } from '../store/gameStore';

/**
 * A tiny state-driven navigator: the store's status decides the screen. Pause and level
 * complete are overlays on the game screen, so the board stays mounted underneath them.
 */
const screenFor = (status: ReturnType<typeof useGameStore.getState>['status']) => {
  switch (status) {
    case 'booting':
      return { key: 'boot', node: <BootScreen /> };
    case 'menu':
      return { key: 'menu', node: <MainMenuScreen /> };
    case 'levelSelect':
      return { key: 'levelSelect', node: <LevelSelectScreen /> };
    case 'settings':
      return { key: 'settings', node: <SettingsScreen /> };
    case 'howToPlay':
      return { key: 'howToPlay', node: <HowToPlayScreen /> };
    case 'playing':
    case 'paused':
    case 'levelComplete':
      return { key: 'game', node: <GameScreen /> };
  }
};

export const AppNavigator = () => {
  const status = useGameStore((s) => s.status);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const { status: current, goBack, backToMenu } = useGameStore.getState();
      if (current === 'menu' || current === 'booting') return false;
      if (current === 'levelComplete') backToMenu();
      else goBack();
      return true;
    });
    return () => sub.remove();
  }, []);

  const { key, node } = screenFor(status);
  return (
    <View style={styles.root}>
      <Animated.View
        key={key}
        entering={reducedMotion ? undefined : FadeIn.duration(220)}
        style={styles.root}
      >
        {node}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({ root: { flex: 1 } });
