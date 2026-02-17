import { StyleSheet, ViewStyle } from 'react-native';

const rawShadows = StyleSheet.create({
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  sticky: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8
  }
});

export const shadows = rawShadows as Record<'card' | 'sticky', ViewStyle>;
