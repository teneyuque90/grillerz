import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type ScreenTemplateProps = {
  title: string;
  subtitle: string;
  badge?: string;
  children?: ReactNode;
};

export function ScreenTemplate({ title, subtitle, badge, children }: ScreenTemplateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.brand}>GRILLERZ</Text>
        {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.card}>{children}</View>

      <Pressable style={styles.cta}>
        <Text style={styles.ctaLabel}>Continuar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md
  },
  heroCard: {
    marginTop: spacing.lg,
    borderRadius: 24,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1
  },
  brand: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1
  },
  badge: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontWeight: '600'
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22
  },
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.background
  },
  cta: {
    alignSelf: 'stretch',
    borderRadius: 14,
    backgroundColor: colors.primary,
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center'
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16
  }
});
