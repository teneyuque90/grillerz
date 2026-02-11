import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  rightAction?: string;
  onRightAction?: () => void;
};

export function ScreenHeader({ title, onBack, rightAction, onRightAction }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.iconButton}>
            <Text style={styles.iconLabel}>{'<'}</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={[styles.side, styles.right]}>
        {rightAction ? (
          <Pressable onPress={onRightAction}>
            <Text style={styles.action}>{rightAction}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  side: {
    width: 56,
    alignItems: 'flex-start'
  },
  right: {
    alignItems: 'flex-end'
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textStrong
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textStrong
  },
  action: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14
  }
});
