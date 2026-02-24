import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../navigation/screenConfig';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { ReliableImageBackground } from '../../components/ui/ReliableImageBackground';
import { colors } from '../../theme/colors';
import { getLocalCoverUriByChef } from '../../data/localMedia';

type Props = NativeStackScreenProps<RootStackParamList, 'SplashScreen'>;

export function SplashScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.headerCopy}>
          <Text style={styles.welcome}>Bienvenido a</Text>
          <View style={styles.logoGlow}>
            <Image source={require('../../../assets/images/grillerz-logo-horizontal.png')} style={styles.brandLockup} resizeMode="contain" />
          </View>
          <Text style={styles.location}>Tu ciudad se configura despues de iniciar sesion</Text>
        </View>

        <View style={styles.hero}>
          <ReliableImageBackground
            uri="https://loremflickr.com/1200/1800/fire,smoke?lock=340"
            fallbackUri={getLocalCoverUriByChef('splash')}
            style={StyleSheet.absoluteFill}
            imageStyle={styles.heroImage}
          />
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
    paddingTop: 22,
    paddingBottom: 28,
    gap: 8
  },
  welcome: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textStrong,
    letterSpacing: 0.2
  },
  logoGlow: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 6
  },
  brandLockup: {
    width: 320,
    height: 168
  },
  location: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700'
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
