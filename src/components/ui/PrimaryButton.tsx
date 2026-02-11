import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../theme/colors';

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
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B21E14',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 2
  },
  compact: {
    minHeight: 48,
    borderRadius: 12
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }]
  },
  label: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800'
  }
});
