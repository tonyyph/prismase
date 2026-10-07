import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../../theme';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { ModalShell } from './ModalShell';

type Props = { onConfirm: () => void; onCancel: () => void };

export const ConfirmResetModal = ({ onConfirm, onCancel }: Props) => (
  <ModalShell onDismiss={onCancel}>
    <AppText variant="title" align="center">
      Reset progress?
    </AppText>
    <AppText color={colors.textSecondary} align="center" style={styles.body}>
      Levels, doubloons and boosters return to the start. Settings are kept. This cannot be undone.
    </AppText>
    <View style={styles.buttons}>
      <AppButton label="Cancel" onPress={onCancel} />
      <AppButton icon="trash" label="Reset everything" onPress={onConfirm} />
    </View>
  </ModalShell>
);

const styles = StyleSheet.create({
  body: { marginTop: spacing.sm, marginBottom: spacing.xl },
  buttons: { gap: spacing.md },
});
