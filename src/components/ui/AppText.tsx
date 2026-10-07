import { Text, type TextProps } from 'react-native';

import { colors, type TypeVariant, typography } from '../../theme';

type Props = TextProps & {
  variant?: TypeVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
};

export const AppText = ({ variant = 'body', color, align, style, ...rest }: Props) => (
  <Text
    allowFontScaling
    maxFontSizeMultiplier={1.3}
    style={[typography[variant], { color: color ?? colors.textPrimary, textAlign: align }, style]}
    {...rest}
  />
);
