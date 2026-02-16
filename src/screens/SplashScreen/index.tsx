import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../navigation/screenConfig';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'SplashScreen'>;

export function SplashScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.headerCopy}>
          <Text style={styles.welcome}>Bienvenido a</Text>
          <Text style={styles.brand}>GRILLERZ</Text>
          <Text style={styles.location}>Nuevo Laredo, Tamaulipas</Text>
        </View>

        <View style={styles.hero}>
          <ImageBackground source={{ uri: 'https://loremflickr.com/1200/1800/fire,smoke?lock=340' }} style={StyleSheet.absoluteFill} imageStyle={styles.heroImage} />
          <LinearGradient colors={['rgba(255,255,255,0.94)', 'rgba(255,255,255,0.82)', 'rgba(20, 10, 8, 0.42)']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['rgba(34, 16, 11, 0.1)', 'rgba(222, 45, 37, 0.55)']} start={{ x: 0.5, y: 0.4 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={styles.ctaContainer}>
            <PrimaryButton label="Empezar" onPress={() => navigation.navigate('Onboarding01')} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  headerCopy: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 28,
    gap: 8
  },
  welcome: {
    fontSize: 36,
    fontWeight: '300',
    color: colors.textStrong
  },
  brand: {
    fontSize: 58,
    lineHeight: 64,
    color: colors.primary,
    letterSpacing: 1,
    fontWeight: '900'
  },
  location: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: '600'
  },
  hero: {
    flex: 1,
    marginTop: 14,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    overflow: 'hidden',
    backgroundColor: colors.overlayDark,
    justifyContent: 'flex-end'
  },
  heroImage: {
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34
  },
  ctaContainer: {
    paddingHorizontal: 22,
    paddingBottom: 28
  }
});
