import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../../theme';
import { AppText } from './AppText';

/** Marks an option that plays a rewarded video. */
export const AdBadge = ({ dark = false }: { dark?: boolean }) => (
  <View style={[styles.badge, dark && styles.dark]}>
    <Ionicons name="play" size={10} color={dark ? '#0B0F1A' : colors.textPrimary} />
    <AppText variant="caption" color={dark ? '#0B0F1A' : colors.textPrimary}>
      AD
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(167,139,250,0.35)',
  },
  dark: { backgroundColor: 'rgba(11,15,26,0.18)' },
});
