import { StyleSheet, View } from 'react-native';

import { useRewardedReady } from '../../hooks/useAds';
import { usePrismaseGame } from '../../hooks/usePrismaseGame';
import { useGameStore } from '../../store/gameStore';
import { spacing } from '../../theme';
import { AdBadge } from '../ui/AdBadge';
import { AppButton } from '../ui/AppButton';
import { HangingSign } from './HangingSign';
import { ModalShell } from './ModalShell';

export const PauseModal = () => {
  const game = usePrismaseGame();
  const level = useGameStore((s) => s.level?.level);
  const skipReady = useRewardedReady('reward_skip_level');

  return (
    <ModalShell
      onDismiss={game.resumeGame}
      header={<HangingSign caption={`HOLD YER HORSES · LEVEL ${level}`} title="Paused" />}
    >
      <View style={styles.buttons}>
        <AppButton variant="primary" icon="play" label="Back to It" onPress={game.resumeGame} />
        <AppButton
          icon="restart"
          label="Restart"
          onPress={() => {
            game.resumeGame();
            void game.restartLevel();
          }}
        />
        <AppButton
          icon="skip"
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
              icon="settings"
              label="Settings"
              onPress={() => game.navigate('settings')}
            />
          </View>
          <View style={styles.half}>
            <AppButton compact icon="home" label="Menu" onPress={game.backToMenu} />
          </View>
        </View>
      </View>
    </ModalShell>
  );
};

const styles = StyleSheet.create({
  buttons: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
});
