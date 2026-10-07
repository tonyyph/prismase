import Constants from 'expo-constants';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ConfirmResetModal } from '../components/overlays/ConfirmResetModal';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Screen } from '../components/ui/Screen';
import { ToggleRow } from '../components/ui/ToggleRow';
import { usePersistedSettings } from '../hooks/usePersistedSettings';
import { usePrismaseGame } from '../hooks/usePrismaseGame';
import { useGameStore } from '../store/gameStore';
import { colors, spacing } from '../theme';

export const SettingsScreen = () => {
  const game = usePrismaseGame();
  const { settings, updateSettings } = usePersistedSettings();
  const resetProgress = useGameStore((s) => s.resetProgress);
  const showToast = useGameStore((s) => s.showToast);
  const [confirming, setConfirming] = useState(false);

  return (
    <Screen title="Settings" onBack={game.goBack}>
      <ScrollView contentContainerStyle={styles.content}>
        <GlassPanel style={styles.panel}>
          <ToggleRow
            icon="musical-notes-outline"
            label="Sound"
            value={settings.soundEnabled}
            onChange={(soundEnabled) => updateSettings({ soundEnabled })}
          />
          <ToggleRow
            icon="phone-portrait-outline"
            label="Haptics"
            value={settings.hapticsEnabled}
            onChange={(hapticsEnabled) => updateSettings({ hapticsEnabled })}
          />
          <ToggleRow
            icon="accessibility-outline"
            label="Reduced motion"
            description="Skip item flights, shimmer and confetti"
            value={settings.reducedMotion}
            onChange={(reducedMotion) => updateSettings({ reducedMotion })}
          />
          <ToggleRow
            icon="bulb-outline"
            label="Animated hints"
            description="Pulse the prisms a hint points at"
            value={settings.hintAnimation}
            onChange={(hintAnimation) => updateSettings({ hintAnimation })}
          />
        </GlassPanel>

        <View style={styles.section}>
          <AppButton
            icon="trash-outline"
            label="Reset progress"
            onPress={() => setConfirming(true)}
          />
        </View>

        <AppText variant="caption" color={colors.textMuted} align="center" style={styles.footer}>
          PRISMASE {Constants.expoConfig?.version ?? '1.0.0'} · OFFLINE · NO ACCOUNT
        </AppText>
      </ScrollView>

      {confirming ? (
        <ConfirmResetModal
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            void resetProgress().then(() => showToast('Progress reset.'));
          }}
        />
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  panel: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  section: { gap: spacing.md },
  footer: { marginTop: spacing.lg },
});
