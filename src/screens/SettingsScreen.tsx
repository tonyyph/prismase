import Constants from 'expo-constants';
import { Fragment, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { starPoints } from '../components/art/geometry';
import { ConfirmResetModal } from '../components/overlays/ConfirmResetModal';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import {
  HangingTitle,
  PAINTED_BOARD_CENTRE,
  PAINTED_BOARD_TOP,
  paintedSignRatio,
} from '../components/ui/HangingTitle';
import { IconButton } from '../components/ui/IconButton';
import { FramedPanel } from '../components/ui/FramedPanel';
import { ToggleRow } from '../components/ui/ToggleRow';
import type { Settings } from '../game/types';
import { usePersistedSettings } from '../hooks/usePersistedSettings';
import { usePrismaseGame } from '../hooks/usePrismaseGame';
import { useGameStore } from '../store/gameStore';
import { colors, spacing } from '../theme';

/** An inked rule with a small star in the middle. */
const StarRule = ({ color = colors.inkSoft }: { color?: string }) => (
  <View style={styles.rule}>
    <View style={[styles.ruleLine, { backgroundColor: color }]} />
    <Svg width={12} height={12} viewBox="0 0 20 20">
      <Polygon points={starPoints(10, 10.5, 9, 3.8)} fill={color} />
    </Svg>
    <View style={[styles.ruleLine, { backgroundColor: color }]} />
  </View>
);

type Row = {
  key: keyof Settings;
  icon: 'sound' | 'haptics' | 'motion' | 'hint';
  label: string;
  description?: string;
};

const ROWS: Row[] = [
  { key: 'soundEnabled', icon: 'sound', label: 'Sound' },
  { key: 'hapticsEnabled', icon: 'haptics', label: 'Haptics' },
  {
    key: 'reducedMotion',
    icon: 'motion',
    label: 'Reduced motion',
    description: 'Skip flying pieces, glints and falling doubloons',
  },
  {
    key: 'hintAnimation',
    icon: 'hint',
    label: 'Animated hints',
    description: 'Pulse the crates a hint points at',
  },
];

/** Settings on a parchment sheet pinned in a brass-framed board, under a hanging title. */
export const SettingsScreen = () => {
  const game = usePrismaseGame();
  const { width } = useWindowDimensions();
  const { settings, updateSettings } = usePersistedSettings();
  const resetProgress = useGameStore((s) => s.resetProgress);
  const showToast = useGameStore((s) => s.showToast);
  const [confirming, setConfirming] = useState(false);
  const insets = useSafeAreaInsets();
  // Leave room for the back button on both sides so the sign stays centred and clear of it.
  const signW = Math.min(width - 2 * (spacing.lg + 62), 260);
  const signH = signW * (paintedSignRatio('Settings') ?? 0.5);
  /**
   * The sign hangs from the top of the screen: its ropes run either side of the Dynamic
   * Island (or notch) and its board starts just below it. Without a cutout the board starts
   * under the status bar.
   */
  const boardTop = Math.max(insets.top, 20) + 6;
  const signTop = boardTop - signH * PAINTED_BOARD_TOP;
  const boardCentre = signTop + signH * PAINTED_BOARD_CENTRE;
  const headerH = signTop + signH + spacing.md;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <View style={{ height: headerH }}>
        <View style={[styles.sign, { top: signTop, left: (width - signW) / 2 }]}>
          <HangingTitle title="Settings" width={signW} />
        </View>
        <View style={[styles.back, { top: boardCentre - 27 }]}>
          <IconButton icon="back" label="Back" box={54} size={26} onPress={game.goBack} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <FramedPanel>
          {ROWS.map((row, i) => (
            <Fragment key={row.key}>
              {i ? <StarRule /> : null}
              <ToggleRow
                icon={row.icon}
                label={row.label}
                description={row.description}
                value={settings[row.key]}
                onChange={(v) => updateSettings({ [row.key]: v })}
              />
            </Fragment>
          ))}
        </FramedPanel>

        <AppButton icon="trash" label="Reset progress" onPress={() => setConfirming(true)} />

        <View style={styles.footer}>
          <AppText variant="caption" color={colors.textSecondary} align="center">
            PRISMASE {Constants.expoConfig?.version ?? '1.0.0'} · OFFLINE · NO ACCOUNT NEEDED
          </AppText>
          <StarRule color={colors.textSecondary} />
        </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  sign: { position: 'absolute' },
  back: { position: 'absolute', left: spacing.lg, zIndex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.7 },
  ruleLine: { flex: 1, height: 1 },
  footer: { gap: spacing.sm, alignItems: 'stretch' },
});
