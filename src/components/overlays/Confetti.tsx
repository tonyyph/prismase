import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Doubloon } from '../art/Doubloon';
import { createRandom } from '../../utils/seedRandom';

type Piece = {
  x: number;
  drift: number;
  delay: number;
  size: number;
  color: string;
  spin: number;
  round: boolean;
};

const Particle = ({ piece, height }: { piece: Piece; height: number }) => {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(
      withDelay(piece.delay, withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) })),
    );
  }, [t, piece.delay]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.8 ? 1 : (1 - t.value) * 5,
    transform: [
      { translateX: piece.x + piece.drift * t.value },
      { translateY: -40 + t.value * height * 0.75 },
      { rotate: `${piece.spin * t.value}deg` },
    ],
  }));
  // "round" pieces are doubloons; the rest are scraps of paper.
  return piece.round ? (
    <Animated.View style={[styles.piece, style]}>
      <Doubloon size={piece.size * 1.6} />
    </Animated.View>
  ) : (
    <Animated.View
      style={[
        styles.piece,
        { width: piece.size, height: piece.size * 0.7, backgroundColor: piece.color },
        style,
      ]}
    />
  );
};

const SCRAPS = ['#ead6a6', '#f3e2b6', '#c9a565', '#b8432b'];

/** A shower of doubloons and torn paper scraps, generated once per win. */
export const Confetti = memo(function Confetti({ seed }: { seed: string }) {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(() => {
    const random = createRandom(seed);
    return Array.from({ length: 16 }, (): Piece => ({
      x: random() * width,
      drift: (random() - 0.5) * 120,
      delay: random() * 400,
      size: 6 + random() * 7,
      color: SCRAPS[Math.floor(random() * SCRAPS.length)],
      spin: (random() - 0.5) * 240,
      round: random() > 0.45,
    }));
  }, [seed, width]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((piece, i) => (
        <Particle key={i} piece={piece} height={height} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  piece: { position: 'absolute', left: 0, top: 0 },
});
