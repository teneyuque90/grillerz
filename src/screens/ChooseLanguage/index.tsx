import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseLanguage'>;

const languages = [
  { label: 'Espanol', helper: 'Idioma principal de la app' },
  { label: 'English', helper: 'For bilingual users' },
  { label: 'Portugues', helper: 'Disponivel para navegacao basica' }
];

export function ChooseLanguage({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScreenHeader title="Idioma" onBack={() => navigation.goBack()} />

        <View style={styles.copyBlock}>
          <Text style={styles.title}>Selecciona idioma</Text>
          <Text style={styles.subtitle}>Puedes cambiarlo despues desde Settings.</Text>
        </View>

        <View style={styles.list}>
          {languages.map((language, index) => (
            <Pressable key={language.label} style={[styles.item, index === 0 ? styles.itemActive : null]}>
              <View>
                <Text style={[styles.itemTitle, index === 0 ? styles.itemTitleActive : null]}>{language.label}</Text>
                <Text style={styles.itemHelper}>{language.helper}</Text>
              </View>
              <View style={[styles.radio, index === 0 ? styles.radioActive : null]} />
            </Pressable>
          ))}
        </View>

        <PrimaryButton label="Continuar" onPress={() => navigation.navigate('Browse01')} />
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
  copyBlock: {
    marginTop: 24,
    gap: 8
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    color: colors.textStrong
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24
  },
  list: {
    marginTop: 24,
    gap: 12
  },
  item: {
    minHeight: 70,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  itemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundMuted
  },
  itemTitle: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '800'
  },
  itemTitleActive: {
    color: colors.primaryDark
  },
  itemHelper: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.borderStrong
  },
  radioActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  }
});
