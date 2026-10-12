import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { MIN_TOUCH, colors, spacing } from '../../theme';
import { WesternIcon, type WesternIconName } from '../art/WesternIcon';
import { AppText } from './AppText';
import { WesternSwitch } from './WesternSwitch';

type Props = {
  icon: WesternIconName;
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

/** One setting on the parchment: brass medallion icon, ink label, wood-and-brass toggle. */
export const ToggleRow = ({ icon, label, description, value, onChange }: Props) => (
  <View style={styles.row}>
    <LinearGradient colors={['#f7dd8c', '#b07a24', '#6b4214']} style={styles.medallion}>
      <View style={styles.medallionFace}>
        <WesternIcon name={icon} size={24} color={colors.ink} />
      </View>
    </LinearGradient>
    <View style={styles.text}>
      <AppText variant="heading" color={colors.ink} style={styles.label}>
        {label}
      </AppText>
      {description ? (
        <AppText variant="body" color={colors.inkSoft} style={styles.desc}>
          {description}
        </AppText>
      ) : null}
    </View>
    <WesternSwitch value={value} onChange={onChange} label={label} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: MIN_TOUCH + 16,
    paddingVertical: spacing.md,
  },
  medallion: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  medallionFace: {
    flex: 1,
    borderRadius: 21,
    backgroundColor: '#f1dfb4',
    borderWidth: 1.5,
    borderColor: colors.brassDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 1 },
  label: { fontSize: 19, lineHeight: 25 },
  desc: { fontSize: 14, lineHeight: 19 },
});
