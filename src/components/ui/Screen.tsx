import type { ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '../../theme';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

type Props = {
  children: ReactNode;
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Safe-area page with an optional back/title header. The backdrop is drawn once by the app. */
export const Screen = ({ children, title, onBack, right, style }: Props) => (
  <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
    {title || onBack ? (
      <View style={styles.header}>
        {onBack ? (
          <IconButton icon="chevron-back" label="Back" onPress={onBack} />
        ) : (
          <View style={styles.spacer} />
        )}
        <AppText variant="heading" style={styles.title} align="center" numberOfLines={1}>
          {title}
        </AppText>
        {right ?? <View style={styles.spacer} />}
      </View>
    ) : null}
    <View style={[styles.body, style]}>{children}</View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  title: { flex: 1 },
  spacer: { width: 44 },
  body: { flex: 1 },
});
