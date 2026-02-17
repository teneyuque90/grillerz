import { TextStyle, ViewStyle } from 'react-native';

export const grillerzSeedColor = '#E53935';

export const grillerzColorScheme = {
  seed: grillerzSeedColor,
  primary: '#E53935',
  onPrimary: '#FFFFFF',
  primaryContainer: '#FFE5E2',
  onPrimaryContainer: '#7A1411',
  secondary: '#C62828',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#FFECEA',
  onSecondaryContainer: '#6E1815',
  background: '#FFFFFF',
  onBackground: '#101828',
  surface: '#FFFFFF',
  onSurface: '#1C1C1E',
  surfaceVariant: '#FFF8F7',
  onSurfaceVariant: '#6B7280',
  outline: '#E5E7EB',
  outlineVariant: '#D0D5DD',
  error: '#B42318',
  onError: '#FFFFFF',
  success: '#16A34A'
} as const;

export const textTheme = {
  titleLarge: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '900',
    color: grillerzColorScheme.onBackground
  } as TextStyle,
  titleMedium: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '800',
    color: grillerzColorScheme.onBackground
  } as TextStyle,
  titleSmall: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '800',
    color: grillerzColorScheme.onBackground
  } as TextStyle,
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: grillerzColorScheme.onSurface
  } as TextStyle,
  bodyMedium: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: grillerzColorScheme.onSurfaceVariant
  } as TextStyle
} as const;

export const shapeTheme = {
  cardRadius: 16,
  cardRadiusLarge: 20,
  buttonRadius: 16,
  chipRadius: 16
} as const;

export class AppSpacing {
  static readonly s8 = 8;
  static readonly s16 = 16;
  static readonly s24 = 24;
  static readonly s32 = 32;
}

export const componentTheme = {
  primaryButton: {
    minHeight: 56,
    borderRadius: shapeTheme.buttonRadius,
    backgroundColor: grillerzColorScheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B21E14',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2
  } as ViewStyle,
  secondaryButton: {
    minHeight: 56,
    borderRadius: shapeTheme.buttonRadius,
    borderWidth: 1.5,
    borderColor: grillerzColorScheme.primary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  } as ViewStyle,
  appCard: {
    borderRadius: shapeTheme.cardRadius,
    borderWidth: 1,
    borderColor: grillerzColorScheme.outline,
    backgroundColor: grillerzColorScheme.surface,
    shadowColor: '#101828',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 1
  } as ViewStyle,
  appChipSelected: {
    minHeight: 36,
    borderRadius: shapeTheme.chipRadius,
    borderWidth: 1,
    borderColor: '#F7C7C5',
    backgroundColor: grillerzColorScheme.primaryContainer,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center'
  } as ViewStyle,
  appChipUnselected: {
    minHeight: 36,
    borderRadius: shapeTheme.chipRadius,
    borderWidth: 1,
    borderColor: grillerzColorScheme.outline,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center'
  } as ViewStyle
} as const;

export const grillerzTheme = {
  useMaterial3: true,
  colorScheme: grillerzColorScheme,
  textTheme,
  shapeTheme,
  spacing: AppSpacing,
  components: componentTheme
} as const;
