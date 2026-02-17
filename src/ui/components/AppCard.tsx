import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { componentTheme } from '../../theme/grillerzTheme';

type AppCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

/**
 * Ejemplo:
 * <AppCard>
 *   <AppText variant="section">Paquete Familiar</AppText>
 * </AppCard>
 */
export function AppCard({ children, style, contentStyle, onPress }: AppCardProps) {
  const cardStyle = [styles.card, style];
  const body = <View style={[styles.content, contentStyle]}>{children}</View>;

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
    ...componentTheme.appCard,
    borderRadius: 16
  },
  content: {
    padding: 16
  },
  pressed: {
    opacity: 0.95
  }
});
