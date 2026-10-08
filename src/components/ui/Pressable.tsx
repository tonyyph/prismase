import type { ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptic } from '../../hooks/useHaptics';
import { useReducedMotion } from '../../hooks/usePersistedSettings';
import { motion } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  /** Scale when pressed. */
  pressScale?: number;
  hapticOnPress?: boolean;
};

/** Pressable with a slight press-in and a light haptic, used by every button. */
export const ScalePressable = ({
  style,
  children,
  pressScale = 0.97,
  hapticOnPress = true,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: Props) => {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      style={[style, animated, disabled && styles.disabled]}
      disabled={disabled}
      onPressIn={(e) => {
        if (!reducedMotion) scale.set(withSpring(pressScale, motion.spring.press));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, motion.spring.release));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (hapticOnPress) haptic('tap');
        onPress?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({ disabled: { opacity: 0.45 } });
