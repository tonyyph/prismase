import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme';
import { AppText } from '../ui/AppText';

/** A board hung from two ropes, with a small caption and a wood-type title. */
export const HangingSign = ({ caption, title }: { caption: string; title: string }) => (
  <View style={styles.wrap}>
    <View style={styles.ropes} pointerEvents="none">
      <View style={styles.rope} />
      <View style={styles.rope} />
    </View>
    <View style={styles.edge}>
      <LinearGradient colors={['#a06a3a', '#6e4223']} style={styles.board}>
        <View style={styles.tacks}>
          <View style={styles.tack} />
          <View style={styles.tack} />
        </View>
        <AppText variant="caption" color={colors.textSecondary} align="center">
          {caption}
        </AppText>
        <AppText variant="title" align="center">
          {title}
        </AppText>
      </LinearGradient>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  ropes: {
    position: 'absolute',
    top: -70,
    height: 80,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rope: {
    width: 4,
    height: '100%',
    backgroundColor: colors.rope,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#7a5a2c',
  },
  edge: { borderRadius: 8, backgroundColor: '#2e180b', paddingBottom: 6 },
  board: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3a1f0e',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  tacks: {
    position: 'absolute',
    top: 8,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tack: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brassLight },
});
