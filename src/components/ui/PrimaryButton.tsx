import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../theme/colors';
import { componentTheme, textTheme } from '../../theme/grillerzTheme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  compact?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, compact = false, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        compact ? styles.compact : null,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null
      ]}
    >
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
  disabled: {
    opacity: 0.55
  },
  label: {
    ...textTheme.bodyLarge,
    color: colors.background,
    fontWeight: '800'
  }
});
