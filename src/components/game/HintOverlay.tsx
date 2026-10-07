import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { BoardLayout, Rect } from './boardLayout';

export type Highlight = { containerId: string; color: string };

type Props = {
  highlights: Highlight[];
  rectFor: (containerId: string) => Rect | undefined;
  layout: BoardLayout;
  pulse: boolean;
};

const Ring = ({
  rect,
  layout,
  color,
  pulse,
}: {
  rect: Rect;
  layout: BoardLayout;
  color: string;
  pulse: boolean;
}) => {
  const glow = useSharedValue(0.6);
  useEffect(() => {
    if (!pulse) {
      glow.set(0.8);
      return undefined;
    }
    glow.set(
      withRepeat(withTiming(1, { duration: 520, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    return () => cancelAnimation(glow);
  }, [pulse, glow]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + glow.value * 0.65,
    transform: [{ scale: 1 + glow.value * 0.04 }],
  }));

  const pad = 5;
  return (
    <Animated.View
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(220)}
      pointerEvents="none"
      style={[
        styles.ring,
        {
          left: rect.x - pad,
          top: rect.y + layout.liftSpace - pad,
          width: layout.tubeWidth + pad * 2,
          height: layout.tubeHeight + pad * 2,
          borderColor: color,
          shadowColor: color,
          borderTopLeftRadius: layout.tubeWidth * 0.3,
          borderTopRightRadius: layout.tubeWidth * 0.3,
          borderBottomLeftRadius: layout.tubeWidth,
          borderBottomRightRadius: layout.tubeWidth,
        },
        style,
      ]}
    />
  );
};

/** Pulsing rings around the containers a hint (or the tutorial) points at. */
export const HintOverlay = ({ highlights, rectFor, layout, pulse }: Props) => (
  <>
    {highlights.map((h) => {
      const rect = rectFor(h.containerId);
      return rect ? (
        <Ring key={h.containerId} rect={rect} layout={layout} color={h.color} pulse={pulse} />
      ) : null;
    })}
  </>
);

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 2.5,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
});
