import { ReactNode } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

type AppScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Ejemplo:
 * <AppScreen scroll>
 *   <SectionHeader title="Inicio" />
 *   <AppCard />
 * </AppScreen>
 */
export function AppScreen({
  children,
  scroll = false,
  padded = true,
  style,
  contentStyle
}: AppScreenProps) {
  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, style]}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            padded ? styles.padded : styles.unpadded,
            contentStyle
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.content,
            styles.fill,
            padded ? styles.padded : styles.unpadded,
            contentStyle
          ]}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  fill: {
    flex: 1
  },
  content: {
    gap: spacing.s16
  },
  padded: {
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s16
  },
  unpadded: {
    paddingHorizontal: 0,
    paddingVertical: 0
  }
});
