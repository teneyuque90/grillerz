import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseLocation'>;

const locations = ['Nuevo Laredo, Tamaulipas', 'Monterrey, Nuevo Leon', 'Saltillo, Coahuila'];

export function ChooseLocation({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScreenHeader title="Elige ubicacion" onBack={() => navigation.goBack()} />

        <View style={styles.searchFake}>
          <Text style={styles.searchText}>Buscar ciudad o direccion...</Text>
        </View>

        <View style={styles.mapMock}>
          <View style={styles.route} />
          <View style={[styles.pin, styles.pinOne]} />
          <View style={[styles.pin, styles.pinTwo]} />
          <View style={[styles.pin, styles.pinThree]} />
        </View>

        <View style={styles.options}>
          {locations.map((city, index) => (
            <Pressable key={city} style={[styles.option, index === 0 ? styles.optionActive : null]}>
              <Text style={[styles.optionLabel, index === 0 ? styles.optionLabelActive : null]}>{city}</Text>
            </Pressable>
          ))}
        </View>

        <PrimaryButton label="Confirmar ubicacion" onPress={() => navigation.navigate('ChooseLanguage')} />
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
    paddingBottom: 24,
    gap: 16
  },
  searchFake: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 14
  },
  searchText: {
    color: colors.textSoft,
    fontSize: 15
  },
  mapMock: {
    height: 250,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundMuted,
    overflow: 'hidden'
  },
  route: {
    position: 'absolute',
    top: 26,
    left: 22,
    right: 22,
    bottom: 30,
    borderWidth: 2,
    borderColor: '#FDD4CD',
    borderRadius: 999
  },
  pin: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 20,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: '#FFFFFF'
  },
  pinOne: {
    top: 62,
    left: 82
  },
  pinTwo: {
    top: 110,
    right: 80
  },
  pinThree: {
    bottom: 64,
    left: 170
  },
  options: {
    gap: 10
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 14
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  optionLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600'
  },
  optionLabelActive: {
    color: colors.primaryDark
  }
});
