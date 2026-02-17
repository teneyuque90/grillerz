import { grillerzColorScheme } from './grillerzTheme';

export const colors = {
  background: grillerzColorScheme.background,
  backgroundMuted: grillerzColorScheme.surfaceVariant,
  surface: grillerzColorScheme.surface,
  primary: grillerzColorScheme.primary,
  primaryDark: '#C62828',
  primarySoft: grillerzColorScheme.primaryContainer,
  secondary: grillerzColorScheme.secondary,
  text: grillerzColorScheme.onSurface,
  textStrong: grillerzColorScheme.onBackground,
  textMuted: grillerzColorScheme.onSurfaceVariant,
  textSoft: '#98A2B3',
  border: grillerzColorScheme.outline,
  borderStrong: grillerzColorScheme.outlineVariant,
  flameStart: '#FF4D2D',
  flameEnd: '#2D120D',
  overlayDark: '#150C0A',
  success: grillerzColorScheme.success
} as const;
