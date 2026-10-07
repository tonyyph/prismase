/**
 * "Dust & Doubloons": a high-noon frontier with a pinch of pirate. Every surface is a real
 * material: weathered wood, saddle leather, wanted-poster paper, brass and forged iron.
 * Gold marks what is selected; brick red marks the primary action.
 */
export const colors = {
  background: '#2a160b',
  background2: '#4a2a17',
  surface: '#5a3420',
  surfaceRaised: '#7a4428',
  surfaceGlass: 'rgba(43,26,16,0.35)',
  surfaceGlassStrong: 'rgba(43,26,16,0.55)',
  borderGlass: 'rgba(43,23,12,0.6)',
  borderGlassStrong: '#2b170c',
  textPrimary: '#fbefd5',
  textSecondary: '#e0c08c',
  textMuted: '#a3825c',
  ink: '#2b1a10',
  inkSoft: '#5a3a20',
  parchment: '#ead6a6',
  parchmentDark: '#c9a565',
  wood: '#8c5a30',
  woodLight: '#b07a45',
  woodDark: '#5a321a',
  plank: '#cfa268',
  brick: '#b8432b',
  brickDark: '#8e2a19',
  brass: '#c9962e',
  brassLight: '#f3d27a',
  brassDark: '#6b4214',
  iron: '#3b3533',
  rope: '#c8a46a',
  /** Selection highlight. */
  gold: '#f2c94c',
  stamp: '#9e2b1a',
  freeInk: '#2f6b2a',
  turquoise: '#2a9d8f',
  danger: '#b8322a',
  scrim: 'rgba(20,9,4,0.66)',
} as const;

export const brassGradient = ['#f7dd8c', '#cc9a34', '#7a4f14'] as const;
export const brickGradient = ['#c94a2f', '#8e2a19'] as const;
export const plankGradient = ['#cfa268', '#a3723d'] as const;
export const woodGradient = ['#9a6435', '#6e4223'] as const;
