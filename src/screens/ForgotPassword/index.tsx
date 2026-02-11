import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { AuthInput } from '../../components/ui/AuthInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPassword({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScreenHeader title="Recuperar cuenta" onBack={() => navigation.goBack()} />

        <View style={styles.copyBlock}>
          <Text style={styles.title}>Olvidaste tu contrasena?</Text>
          <Text style={styles.subtitle}>Ingresa tu correo para enviarte el codigo de verificacion.</Text>
        </View>

        <View style={styles.form}>
          <AuthInput label="Correo" placeholder="tu@email.com" />
          <PrimaryButton label="Enviar codigo" onPress={() => navigation.navigate('VerificationCode')} />
        </View>

        <Text style={styles.help}>Te enviaremos un codigo valido por 10 minutos.</Text>
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
    marginTop: 34,
    gap: 8
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '900',
    color: colors.textStrong,
    maxWidth: 280
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 330
  },
  form: {
    marginTop: 36,
    gap: 20
  },
  help: {
    marginTop: 16,
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18
  }
});
