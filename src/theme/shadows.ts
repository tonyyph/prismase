import type { ViewStyle } from 'react-native';

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
