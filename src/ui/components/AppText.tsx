import { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';

import { colors } from '../../theme/colors';
import { textTheme } from '../../theme/grillerzTheme';

type AppTextVariant = 'title' | 'h2' | 'section' | 'body' | 'caption';

type AppTextProps = Omit<TextProps, 'style'> & {
  children: ReactNode;
  variant?: AppTextVariant;
  style?: StyleProp<TextStyle>;
};

/**
 * Ejemplo:
 * <AppText variant="title">Grillerz</AppText>
 * <AppText variant="caption">Nuevo Laredo</AppText>
 */
export function AppText({ children, variant = 'body', style, ...rest }: AppTextProps) {
  return (
    <Text {...rest} style={[variantStyles[variant], style]}>
      {children}
    </Text>
  );
}

const variantStyles = StyleSheet.create({
  title: {
    ...textTheme.titleLarge
  },
  h2: {
    ...textTheme.titleMedium
  },
  section: {
    ...textTheme.titleSmall
  },
  body: {
    ...textTheme.bodyLarge
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.textMuted
  }
}) as Record<AppTextVariant, TextStyle>;
