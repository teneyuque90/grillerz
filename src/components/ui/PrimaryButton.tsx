import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../theme/colors';
import { componentTheme, textTheme } from '../../theme/grillerzTheme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  compact?: boolean;
};

export function PrimaryButton({ label, onPress, compact = false }: PrimaryButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, compact ? styles.compact : null, pressed ? styles.pressed : null]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    ...componentTheme.primaryButton
  },
  compact: {
    minHeight: 48,
    borderRadius: 16
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }]
  },
  label: {
    ...textTheme.bodyLarge,
    color: colors.background,
    fontWeight: '800'
  }
});
