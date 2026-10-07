import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { PRISM_COLORS } from '../../game/constants';
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
  return (
    <Animated.View
      style={[
        styles.piece,
        {
          width: piece.size,
          height: piece.round ? piece.size : piece.size * 0.45,
          borderRadius: piece.round ? piece.size / 2 : 2,
          backgroundColor: piece.color,
        },
        style,
      ]}
    />
  );
};

/** A light shower of spectral flecks, generated once per win. */
export const Confetti = memo(function Confetti({ seed }: { seed: string }) {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(() => {
    const random = createRandom(seed);
    return Array.from({ length: 28 }, (): Piece => ({
      x: random() * width,
      drift: (random() - 0.5) * 120,
      delay: random() * 400,
      size: 6 + random() * 7,
      color: PRISM_COLORS[Math.floor(random() * 6)].base,
      spin: (random() - 0.5) * 720,
      round: random() > 0.6,
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
