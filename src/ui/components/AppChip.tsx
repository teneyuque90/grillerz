import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { colors } from '../../theme/colors';
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
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selected: {
    borderColor: '#F7C7C5',
    backgroundColor: colors.primarySoft
  },
  unselected: {
    borderColor: colors.border,
    backgroundColor: '#FFFFFF'
  },
  label: {
    fontWeight: '700'
  },
  labelSelected: {
    color: colors.primaryDark
  },
  labelUnselected: {
    color: colors.textMuted
  },
  pressed: {
    opacity: 0.92
  }
});
