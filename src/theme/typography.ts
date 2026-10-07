import type { TextStyle } from 'react-native';

export const fonts = {
  display: 'Sora_700Bold',
  displaySemi: 'Sora_600SemiBold',
  body: 'Manrope_500Medium',
  bodyBold: 'Manrope_700Bold',
  bodyExtraBold: 'Manrope_800ExtraBold',
} as const;

export type TypeVariant = 'hero' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'number';

export const typography: Record<TypeVariant, TextStyle> = {
  hero: { fontFamily: fonts.display, fontSize: 44, lineHeight: 56, letterSpacing: -0.5 },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 38 },
  heading: { fontFamily: fonts.displaySemi, fontSize: 19, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 20, letterSpacing: 0.2 },
  caption: { fontFamily: fonts.bodyBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  number: { fontFamily: fonts.bodyExtraBold, fontSize: 16, lineHeight: 22 },
};
