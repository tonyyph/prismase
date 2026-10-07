import type { ViewStyle } from 'react-native';

/** A soft coloured halo, used sparingly (selection, hints). */
export const glow = (color: string, radius = 12, opacity = 0.6): ViewStyle => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: 0 },
});

/** Wood and paper sit on the table: a short, hard drop shadow. */
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  } satisfies ViewStyle,
};
