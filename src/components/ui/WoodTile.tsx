import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { woodGradient } from '../../theme';

/** A small block of stained wood on a dark drop edge: icon buttons, action tiles, chips. */
export const WoodTile = ({
  children,
  style,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) => (
  <View style={styles.edge}>
    <LinearGradient colors={woodGradient} style={[styles.face, style]}>
      <View pointerEvents="none" style={[styles.seam, { top: '35%' }]} />
      <View pointerEvents="none" style={[styles.seam, { top: '68%' }]} />
      {children}
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  edge: { flex: 1, borderRadius: 10, backgroundColor: '#2e180b', paddingBottom: 3 },
  face: { flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: '#3a1f0e' },
  seam: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(46,24,11,0.35)',
  },
});
