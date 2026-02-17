import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../theme';

type AppCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padded?: boolean;
};

/**
 * Ejemplo:
 * <AppCard>
 *   <AppText variant="section">Paquete Familiar</AppText>
 * </AppCard>
 */
export function AppCard({ children, style, contentStyle, onPress, padded = true }: AppCardProps) {
  const cardStyle = [styles.card, style];
  const body = <View style={[styles.content, padded ? styles.padded : styles.unpadded, contentStyle]}>{children}</View>;

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed ? styles.pressed : null]}>
        {body}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{body}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.r16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card
  },
  content: {
    gap: spacing.s8
  },
  padded: {
    padding: spacing.s16
  },
  unpadded: {
    padding: 0
  },
  pressed: {
    opacity: 0.95
  }
});
