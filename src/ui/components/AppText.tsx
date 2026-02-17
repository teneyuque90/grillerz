import { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';

import { colors, typography } from '../theme';

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
    ...typography.title,
    color: colors.text
  },
  h2: {
    ...typography.h2,
    color: colors.text
  },
  section: {
    ...typography.section,
    color: colors.text
  },
  body: {
    ...typography.body,
    color: colors.text
  },
  caption: {
    ...typography.caption,
    color: colors.muted
  }
}) as Record<AppTextVariant, TextStyle>;
