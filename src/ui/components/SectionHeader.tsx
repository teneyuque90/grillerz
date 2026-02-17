import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing, typography } from '../theme';
import { AppText } from './AppText';

type SectionHeaderProps = {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
};

/**
 * Ejemplo:
 * <SectionHeader title="Recomendados" actionText="Ver todo" onActionPress={goAll} />
 */
export function SectionHeader({ title, actionText, onActionPress }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <AppText variant="section">{title}</AppText>
      {actionText ? (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <AppText variant="body" style={styles.action}>
            {actionText}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.s16
  },
  action: {
    color: colors.primary,
    ...typography.body,
    fontWeight: '600'
  }
});
