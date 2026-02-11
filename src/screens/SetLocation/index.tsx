import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'SetLocation'>;

export function SetLocation({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScreenHeader title="Ubicacion" onBack={() => navigation.goBack()} />

        <LinearGradient colors={['#FFF4F2', '#FFE7E3']} style={styles.heroCard}>
          <View style={styles.mapSphere}>
            <View style={styles.pin} />
          </View>
          <Text style={styles.heroTitle}>Activa tu ubicacion</Text>
          <Text style={styles.heroSubtitle}>Para mostrarte parrilleros disponibles cerca de ti.</Text>
        </LinearGradient>

        <View style={styles.listCard}>
          <Text style={styles.listTitle}>Ventajas</Text>
          <Text style={styles.bullet}>- Resultados por distancia real.</Text>
          <Text style={styles.bullet}>- Tiempo estimado de llegada.</Text>
          <Text style={styles.bullet}>- Disponibilidad local inmediata.</Text>
        </View>

        <View style={styles.ctaGroup}>
          <PrimaryButton label="Permitir ubicacion" onPress={() => navigation.navigate('ChooseLocation')} />
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
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingBottom: 24
  },
  heroCard: {
    marginTop: 24,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center'
  },
  mapSphere: {
    width: 116,
    height: 116,
    borderRadius: 116,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFD9D3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pin: {
    width: 24,
    height: 24,
    borderRadius: 24,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: '#FFFFFF'
  },
  heroTitle: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: '900',
    color: colors.textStrong
  },
  heroSubtitle: {
    marginTop: 8,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 290
  },
  listCard: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 10
  },
  listTitle: {
    fontSize: 16,
    color: colors.textStrong,
    fontWeight: '800'
  },
  bullet: {
    color: colors.textMuted,
    fontSize: 15
  },
  ctaGroup: {
    marginTop: 'auto'
  }
});
