export const colors = {
  background: '#070A12',
  background2: '#101426',
  surface: '#121827',
  surfaceRaised: '#182036',
  surfaceGlass: 'rgba(255,255,255,0.08)',
  surfaceGlassStrong: 'rgba(255,255,255,0.12)',
  borderGlass: 'rgba(255,255,255,0.14)',
  borderGlassStrong: 'rgba(255,255,255,0.24)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  cyan: '#22D3EE',
  violet: '#A78BFA',
  pink: '#F472B6',
  emerald: '#34D399',
  amber: '#FBBF24',
  danger: '#FB7185',
  scrim: 'rgba(3,5,10,0.72)',
} as const;

/** The spectrum gradient used for the logo and primary accents. */
export const spectrum = [colors.cyan, colors.violet, colors.pink] as const;
