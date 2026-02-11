import { StyleSheet, Text, View } from 'react-native';
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
          <LinearGradient colors={[colors.flameEnd, colors.flameStart]} start={{ x: 0.5, y: 1 }} end={{ x: 0.5, y: 0 }} style={StyleSheet.absoluteFill} />
          <View style={styles.smokeLayer}>
            <View style={[styles.smokeCircle, styles.smokeLarge]} />
            <View style={[styles.smokeCircle, styles.smokeMid]} />
            <View style={[styles.smokeCircle, styles.smokeSmall]} />
          </View>
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
  smokeLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center'
  },
  smokeCircle: {
    borderRadius: 999,
    position: 'absolute',
    backgroundColor: '#FFFFFF'
  },
  smokeLarge: {
    width: 290,
    height: 290,
    opacity: 0.42,
    top: 70
  },
  smokeMid: {
    width: 220,
    height: 220,
    opacity: 0.35,
    top: 105,
    left: 45
  },
  smokeSmall: {
    width: 170,
    height: 170,
    opacity: 0.3,
    top: 140,
    right: 58
  },
  ctaContainer: {
    paddingHorizontal: 22,
    paddingBottom: 28
  }
});
