import { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors } from '../../theme/colors';
import { AppSpacing } from '../../theme/grillerzTheme';

type AppScreenProps = {
  children: ReactNode;
  scroll?: boolean;
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
export function AppScreen({ children, scroll = false, style, contentStyle }: AppScreenProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      {scroll ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, contentStyle]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
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
    paddingHorizontal: AppSpacing.s16,
    paddingVertical: AppSpacing.s16,
    gap: AppSpacing.s16
  }
});
