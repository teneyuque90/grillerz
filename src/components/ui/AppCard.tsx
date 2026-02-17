import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { componentTheme } from '../../theme/grillerzTheme';

type AppCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padded?: boolean;
};

export function AppCard({ children, style, onPress, padded = true }: AppCardProps) {
  const composedStyle = [styles.card, padded ? styles.padded : null, style];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [composedStyle, pressed ? styles.pressed : null]}>
        {children}
      </Pressable>
    );
  }

  return <View style={composedStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    ...componentTheme.appCard
  },
  padded: {
    padding: 16
  },
  pressed: {
    opacity: 0.96
  }
});
