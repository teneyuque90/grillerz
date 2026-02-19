import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthInput } from '../../components/ui/AuthInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { OFFLINE_DEMO_MODE } from '../../config/api';
import { RootStackParamList } from '../../navigation/screenConfig';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export function SignIn({ navigation }: Props) {
  const { signIn } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignIn() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await signIn({ email, password });

    if (!result.ok) {
      setError(result.message ?? 'No se pudo iniciar sesion.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    navigation.navigate('Browse01');
  }

  async function handleOfflineDemoSignIn() {
    if (isSubmitting) {
      return;
    }

    const demoEmail = 'gabriel@email.com';
    const demoPassword = '123456';
    setEmail(demoEmail);
    setPassword(demoPassword);

    setIsSubmitting(true);
    setError(null);

    const result = await signIn({ email: demoEmail, password: demoPassword });

    if (!result.ok) {
      setError(result.message ?? 'No se pudo iniciar sesion en modo demo.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    navigation.navigate('Browse01');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.topArea}>
          <Text style={styles.brand}>GRILLERZ</Text>
          <Text style={styles.title}>Bienvenido de vuelta</Text>
          <Text style={styles.subtitle}>Inicia sesion para contratar tu griller ideal.</Text>
        </View>

        <View style={styles.form}>
          {OFFLINE_DEMO_MODE ? (
            <View style={styles.offlineNotice}>
              <Text style={styles.offlineTitle}>Modo demo offline activado</Text>
              <Text style={styles.offlineText}>Esta app funciona sin internet para presentaciones.</Text>
              <Text style={styles.offlineHint}>Cliente: cliente@grillerz.app / Cliente123!</Text>
              <Text style={styles.offlineHint}>Griller: erick@grillerz.app / Griller123!</Text>
              <Text style={styles.offlineHint}>Admin: gabriel@email.com / 123456</Text>
            </View>
          ) : null}

          <AuthInput
            label="Correo"
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <AuthInput
            label="Contrasena"
            placeholder="Ingresa tu contrasena"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotLink}>
            <Text style={styles.forgotText}>Olvide mi contrasena</Text>
          </Pressable>

          <PrimaryButton label={isSubmitting ? 'Ingresando...' : 'Iniciar sesion'} onPress={handleSignIn} />

          {OFFLINE_DEMO_MODE ? <PrimaryButton compact label="Entrar demo offline" onPress={handleOfflineDemoSignIn} /> : null}
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>No tienes cuenta?</Text>
          <Pressable onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.bottomAction}>Registrate</Text>
          </Pressable>
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
  topArea: {
    paddingTop: 40,
    gap: 8
  },
  brand: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary
  },
  title: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: '900',
    color: colors.textStrong
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320
  },
  form: {
    marginTop: 38,
    gap: 16
  },
  offlineNotice: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FFF1F0',
    padding: 12,
    gap: 4
  },
  offlineTitle: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 13
  },
  offlineText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16
  },
  offlineHint: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12
  },
  errorText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700'
  },
  forgotLink: {
    alignSelf: 'flex-end'
  },
  forgotText: {
    color: colors.primaryDark,
    fontWeight: '700'
  },
  bottomRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  bottomText: {
    color: colors.textMuted,
    fontSize: 14
  },
  bottomAction: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14
  }
});
