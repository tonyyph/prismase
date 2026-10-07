import { StyleSheet, View } from 'react-native';

import { useRewardedReady } from '../../hooks/useAds';
import { usePrismaseGame } from '../../hooks/usePrismaseGame';
import { useGameStore } from '../../store/gameStore';
import { colors, spacing } from '../../theme';
import { AdBadge } from '../ui/AdBadge';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { ModalShell } from './ModalShell';

export const PauseModal = () => {
  const game = usePrismaseGame();
  const level = useGameStore((s) => s.level?.level);
  const skipReady = useRewardedReady('reward_skip_level');

  return (
    <ModalShell onDismiss={game.resumeGame}>
      <AppText variant="caption" color={colors.textSecondary} align="center">
        LEVEL {level}
      </AppText>
      <AppText variant="title" align="center" style={styles.title}>
        Paused
      </AppText>
      <View style={styles.buttons}>
        <AppButton variant="primary" icon="play" label="Resume" onPress={game.resumeGame} />
        <AppButton
          icon="refresh"
          label="Restart"
          onPress={() => {
            game.resumeGame();
            void game.restartLevel();
          }}
        />
        <AppButton
          icon="play-skip-forward"
          label="Skip level"
          accessory={<AdBadge />}
          disabled={!skipReady}
          accessibilityHint="Watch an ad to unlock the next level"
          onPress={() => void game.skipLevel()}
        />
        <View style={styles.row}>
          <View style={styles.half}>
            <AppButton
              compact
              icon="settings-outline"
              label="Settings"
              onPress={() => game.navigate('settings')}
            />
          </View>
          <View style={styles.half}>
            <AppButton compact icon="home-outline" label="Menu" onPress={game.backToMenu} />
          </View>
        </View>
      </View>
    </ModalShell>
  );
};

const styles = StyleSheet.create({
  title: { marginBottom: spacing.lg },
  buttons: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
});
