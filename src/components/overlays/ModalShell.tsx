import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

import { useReducedMotion } from '../../hooks/usePersistedSettings';
import { colors, spacing } from '../../theme';
import { GlassPanel } from '../ui/GlassPanel';

type Props = {
  children: ReactNode;
  onDismiss?: () => void;
  /** Delay before the panel appears, e.g. to let the winning move land first. */
  delay?: number;
  behind?: ReactNode;
};

/** Scrim plus a centred glass panel that fades and scales in. */
export const ModalShell = ({ children, onDismiss, delay = 0, behind }: Props) => {
  const reducedMotion = useReducedMotion();
  return (
    <Animated.View
      entering={FadeIn.duration(reducedMotion ? 0 : 220).delay(delay)}
      exiting={FadeOut.duration(160)}
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
              : ZoomIn.springify()
                  .damping(16)
                  .delay(delay + 40)
          }
          style={styles.panelWrap}
        >
          <GlassPanel>{children}</GlassPanel>
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
