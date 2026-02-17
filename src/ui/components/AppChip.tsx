import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';

type AppChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Ejemplo:
 * <AppChip label="Top rated" selected onPress={toggle} />
 */
export function AppChip({ label, selected = false, onPress, style }: AppChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        pressed && onPress ? styles.pressed : null,
        style
      ]}
    >
      <AppText variant="caption" style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    borderRadius: radius.r16,
    borderWidth: 1,
    paddingHorizontal: spacing.s12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.chipBg
  },
  unselected: {
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  label: {
    fontWeight: '600'
  },
  labelSelected: {
    color: colors.primary
  },
  labelUnselected: {
    color: colors.muted
  },
  pressed: {
    opacity: 0.92
  }
});
