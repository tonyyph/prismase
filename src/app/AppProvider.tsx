import { PirataOne_400Regular } from '@expo-google-fonts/pirata-one';
import { Rye_400Regular } from '@expo-google-fonts/rye';
import { Bitter_500Medium, Bitter_600SemiBold, Bitter_700Bold } from '@expo-google-fonts/bitter';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { type ReactNode, useEffect } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { registerDevLinks } from '../dev/devLinks';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useGameStore } from '../store/gameStore';
import { colors } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/** Loads fonts and saved state, wires sound/haptic feedback, then hides the splash. */
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [fontsLoaded, fontError] = useFonts({
    Rye_400Regular,
    PirataOne_400Regular,
    Bitter_500Medium,
    Bitter_600SemiBold,
    Bitter_700Bold,
  });
  const boot = useGameStore((s) => s.boot);
  useSoundEffects();

  useEffect(() => {
    void boot();
  }, [boot]);

  useEffect(registerDevLinks, []);

  // Leaving the app mid-level pauses it, so nobody returns to a running board.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') useGameStore.getState().openPause();
    });
    return () => sub.remove();
  }, []);

  const ready = fontsLoaded || !!fontError;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>{ready ? children : null}</View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.background } });
