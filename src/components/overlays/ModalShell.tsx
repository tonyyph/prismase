import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { useReducedMotion } from '../../hooks/usePersistedSettings';
import { colors, motion, spacing } from '../../theme';
import { GlassPanel } from '../ui/GlassPanel';

type Props = {
  children: ReactNode;
  onDismiss?: () => void;
  /** Delay before the panel appears, e.g. to let the winning move land first. */
  delay?: number;
  behind?: ReactNode;
  /** Drawn above the panel, e.g. the rope-hung sign on Pause. */
  header?: ReactNode;
  material?: 'wood' | 'parchment';
};

/** Scrim plus a centred glass panel that fades and scales in. */
export const ModalShell = ({
  children,
  onDismiss,
  delay = 0,
  behind,
  header,
  material = 'wood',
}: Props) => {
  const reducedMotion = useReducedMotion();
  return (
    <Animated.View
      entering={FadeIn.duration(reducedMotion ? 0 : motion.duration.fade).delay(delay)}
      exiting={FadeOut.duration(200)}
      style={[StyleSheet.absoluteFill, styles.scrim]}
      accessibilityViewIsModal
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onDismiss}
        accessible={false}
        disabled={!onDismiss}
      />
      {behind}
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View
          entering={
            reducedMotion
              ? undefined
              : FadeInDown.duration(motion.duration.modal)
                  .easing(motion.settle)
                  .delay(delay + 40)
          }
          style={styles.panelWrap}
        >
          {header}
          <GlassPanel material={material}>{children}</GlassPanel>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  scrim: { backgroundColor: colors.scrim },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  panelWrap: { width: '100%', maxWidth: 420, alignSelf: 'center' },
});
