import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors } from '../../theme/colors';
import { componentTheme, textTheme } from '../../theme/grillerzTheme';

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SecondaryButton({ label, onPress, compact = false, style }: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact ? styles.compact : null,
        pressed ? styles.pressed : null,
        style
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    ...componentTheme.secondaryButton
  },
  compact: {
    minHeight: 48
  },
  pressed: {
    opacity: 0.9
  },
  label: {
    ...textTheme.bodyLarge,
    color: colors.primary,
    fontWeight: '800'
  }
});
