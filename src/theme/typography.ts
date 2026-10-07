import type { TextStyle } from 'react-native';

/**
 * Rye (wood-type poster) for titles, Pirata One only for treasure moments,
 * Bitter (letterpress slab, lining figures) for everything else. Line heights clear each font's measured line box
 * (Rye 1.25 em, Pirata One 1.285 em, Bitter 1.2 em) so glyphs never clip.
 */
export const fonts = {
  western: 'Rye_400Regular',
  pirate: 'PirataOne_400Regular',
  slab: 'Bitter_500Medium',
  slabSemi: 'Bitter_600SemiBold',
  slabBold: 'Bitter_700Bold',
} as const;

export type TypeVariant =
  'hero' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'number' | 'treasure';

export const typography: Record<TypeVariant, TextStyle> = {
  hero: { fontFamily: fonts.western, fontSize: 40, lineHeight: 54 },
  title: { fontFamily: fonts.western, fontSize: 26, lineHeight: 36 },
  heading: { fontFamily: fonts.slabBold, fontSize: 18, lineHeight: 25 },
  body: { fontFamily: fonts.slab, fontSize: 15, lineHeight: 21 },
  label: { fontFamily: fonts.slabBold, fontSize: 14, lineHeight: 19, letterSpacing: 1.2 },
  caption: { fontFamily: fonts.slabBold, fontSize: 11, lineHeight: 15, letterSpacing: 1.4 },
  number: { fontFamily: fonts.slabBold, fontSize: 18, lineHeight: 24 },
  treasure: { fontFamily: fonts.pirate, fontSize: 30, lineHeight: 40 },
};
