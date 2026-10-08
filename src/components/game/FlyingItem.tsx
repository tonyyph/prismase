import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '../../theme';
import { PrismItem } from './PrismItem';

type Point = { x: number; y: number };

type Props = {
  colorId: string;
  size: number;
  from: Point;
  to: Point;
  onDone: () => void;
};

/** Carries an item along a short arc between two board points, then hands it back. */
export const FlyingItem = ({ colorId, size, from, to, onDone }: Props) => {
  const t = useSharedValue(0);
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const arc = size * 0.3 + distance * 0.06;
  const duration = Math.min(380, 240 + distance * 0.3);

  useEffect(() => {
    t.set(
      withTiming(1, { duration, easing: motion.travel }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
  }, [t, duration, onDone]);

  const style = useAnimatedStyle(() => {
    const p = t.value;
    const x = from.x + (to.x - from.x) * p;
    const y = from.y + (to.y - from.y) * p - Math.sin(Math.PI * p) * arc;
    return {
      transform: [{ translateX: x - size / 2 }, { translateY: y - size / 2 }],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.item, { width: size, height: size }, style]}>
      <PrismItem colorId={colorId} size={size} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  item: { position: 'absolute', left: 0, top: 0 },
});
