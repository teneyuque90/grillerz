import { StyleSheet, TextStyle } from 'react-native';

export const colors = {
  primary: '#E53935',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  chipBg: '#FFF1F1',
  successBg: '#E8F5E9',
  warningBg: '#FFF7ED'
} as const;

export const spacing = {
  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s20: 20,
  s24: 24,
  s32: 32
} as const;

export const radius = {
  r12: 12,
  r16: 16,
  r20: 20
} as const;

type TypographyKey = 'title' | 'h2' | 'section' | 'body' | 'caption';

const rawTypography = StyleSheet.create({
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
    color: colors.text
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.text
  },
  section: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.text
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.text
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: colors.muted
  }
});

export const typography = rawTypography as Record<TypographyKey, TextStyle>;
