import { useEffect } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { haptic } from '../../hooks/useHaptics';
import { useReducedMotion } from '../../hooks/usePersistedSettings';
import { motion } from '../../theme';

/** Tony's toggle art, cut by tools/slice-switch.js: tracks are 870 × 380, knob 258 across. */
const ON = require('../../../assets/switch/on.png');
const OFF = require('../../../assets/switch/off.png');
const KNOB = require('../../../assets/switch/knob.png');

const W = 74;
const H = (W * 380) / 870;
const KNOB_D = (W * 258) / 870;
/** Knob centre at OFF and ON, and its height, as measured on the art. */
const X_OFF = (W * (1240 - 1058)) / 870;
const X_ON = (W * (762 - 72)) / 870;
const Y = (H * (317 - 128)) / 380;

type Props = { value: boolean; onChange: (v: boolean) => void; label: string };

/**
 * Brass-framed toggle: the brushed-brass knob slides across, and the red-painted ON track is
 * revealed behind it over the dark-wood OFF track, so the colour follows the knob.
 */
export const WesternSwitch = ({ value, onChange, label }: Props) => {
  const reducedMotion = useReducedMotion();
  const t = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    t.set(
      reducedMotion
        ? value
          ? 1
          : 0
        : withTiming(value ? 1 : 0, { duration: 240, easing: motion.settle }),
    );
  }, [value, reducedMotion, t]);

  const reveal = useAnimatedStyle(() => ({ width: X_OFF + (X_ON - X_OFF) * t.value }));
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: X_OFF + (X_ON - X_OFF) * t.value - KNOB_D / 2 }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={10}
      onPress={() => {
        haptic('tap');
        onChange(!value);
      }}
      style={styles.root}
    >
      <Image source={OFF} style={styles.track} fadeDuration={0} />
      <Animated.View style={[styles.reveal, reveal]}>
        <Image source={ON} style={styles.track} fadeDuration={0} />
      </Animated.View>
      <Animated.View style={[styles.knob, knob]}>
        <Image source={KNOB} style={styles.knobImage} fadeDuration={0} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    width: W,
    height: H,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  track: { position: 'absolute', left: 0, top: 0, width: W, height: H },
  reveal: { position: 'absolute', left: 0, top: 0, height: H, overflow: 'hidden' },
  knob: { position: 'absolute', left: 0, top: Y - KNOB_D / 2, width: KNOB_D, height: KNOB_D },
  knobImage: { width: KNOB_D, height: KNOB_D },
});
