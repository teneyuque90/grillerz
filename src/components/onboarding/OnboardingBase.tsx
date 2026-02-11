import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { PrimaryButton } from '../ui/PrimaryButton';

type OnboardingBaseProps = {
  step: 1 | 2 | 3;
  title: string;
  subtitle: string;
  illustration: ReactNode;
  onNext: () => void;
  onSkip: () => void;
  nextLabel?: string;
};

export function OnboardingBase({ step, title, subtitle, illustration, onNext, onSkip, nextLabel = 'Siguiente' }: OnboardingBaseProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <Text style={styles.stepLabel}>0{step} / 03</Text>
          <Pressable onPress={onSkip}>
            <Text style={styles.skip}>Saltar</Text>
          </Pressable>
        </View>

        <View style={styles.illustration}>{illustration}</View>

        <View style={styles.copyBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            <View style={[styles.dot, step === 1 ? styles.dotActive : null]} />
            <View style={[styles.dot, step === 2 ? styles.dotActive : null]} />
            <View style={[styles.dot, step === 3 ? styles.dotActive : null]} />
          </View>

          <PrimaryButton label={nextLabel} onPress={onNext} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20
  },
  headerRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stepLabel: {
    color: colors.textSoft,
    fontWeight: '700',
    letterSpacing: 0.4
  },
  skip: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700'
  },
  illustration: {
    height: 330,
    borderRadius: 28,
    marginTop: 12,
    overflow: 'hidden'
  },
  copyBlock: {
    marginTop: 28,
    gap: 10
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    color: colors.textStrong
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24
  },
  footer: {
    marginTop: 'auto',
    gap: 18
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 20,
    backgroundColor: colors.primarySoft
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.primary
  }
});
