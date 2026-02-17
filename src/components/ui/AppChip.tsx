import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors } from '../../theme/colors';
import { componentTheme } from '../../theme/grillerzTheme';

type AppChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function AppChip({ label, selected = false, onPress, style }: AppChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        pressed ? styles.pressed : null,
        style
      ]}
    >
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12
  },
  selected: {
    ...componentTheme.appChipSelected
  },
  unselected: {
    ...componentTheme.appChipUnselected
  },
  pressed: {
    opacity: 0.92
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700'
  },
  labelSelected: {
    color: colors.primaryDark
  },
  labelUnselected: {
    color: colors.textMuted
  }
});
