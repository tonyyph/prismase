import type { ViewStyle } from 'react-native';

/** A coloured bloom. On Android elevation shadows cannot be tinted, so it falls back to a soft drop. */
export const glow = (color: string, radius = 16, opacity = 0.6): ViewStyle => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: 0 },
});

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  } satisfies ViewStyle,
};
