import { StyleSheet, View } from 'react-native';

import { colors } from '../../theme';
import { AppText } from './AppText';

/** A red rubber stamp marking an option that plays a rewarded video. */
export const AdBadge = (_props: { dark?: boolean }) => (
  <View style={styles.stamp}>
    <AppText variant="caption" color={colors.stamp} style={styles.text}>
      AD
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  stamp: {
    paddingHorizontal: 5,
    borderWidth: 1.6,
    borderStyle: 'dashed',
    borderColor: colors.stamp,
    borderRadius: 2,
    transform: [{ rotate: '-4deg' }],
    backgroundColor: 'rgba(234,214,166,0.35)',
  },
  text: { letterSpacing: 1 },
});
