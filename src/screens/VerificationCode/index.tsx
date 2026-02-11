import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'VerificationCode'>;

export function VerificationCode({ navigation }: Props) {
  const { completeVerification } = useAppState();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const digits = [0, 1, 2, 3].map((index) => code[index] ?? '-');

  async function handleVerify() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await completeVerification(code);

    if (!result.ok) {
      setError(result.message ?? 'No se pudo verificar el codigo.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    navigation.navigate('SetLocation');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScreenHeader title="Verificacion" onBack={() => navigation.goBack()} />

        <View style={styles.copyBlock}>
          <Text style={styles.title}>Ingresa el codigo</Text>
          <Text style={styles.subtitle}>Lo enviamos a tu correo. Revisa spam si no lo encuentras.</Text>
        </View>

        <View style={styles.codeRow}>
          {digits.map((digit, index) => (
            <View key={`${digit}-${index}`} style={styles.codeBox}>
              <Text style={styles.codeDigit}>{digit}</Text>
            </View>
          ))}
        </View>

        <TextInput
          value={code}
          onChangeText={(value) => setCode(value.replace(/[^0-9]/g, '').slice(0, 4))}
          keyboardType="number-pad"
          style={styles.codeInput}
          maxLength={4}
          placeholder="Codigo de 4 digitos"
          placeholderTextColor={colors.textSoft}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.resendButton}>
          <Text style={styles.resendLabel}>Reenviar codigo (00:29)</Text>
        </Pressable>

        <View style={styles.ctaWrap}>
          <PrimaryButton label={isSubmitting ? 'Verificando...' : 'Verificar'} onPress={handleVerify} />
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
  copyBlock: {
    marginTop: 34,
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
    lineHeight: 24,
    maxWidth: 320
  },
  codeRow: {
    marginTop: 42,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  codeBox: {
    width: 72,
    height: 72,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundMuted
  },
  codeDigit: {
    color: colors.textStrong,
    fontSize: 28,
    fontWeight: '900'
  },
  codeInput: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    color: colors.textStrong,
    fontWeight: '700'
  },
  errorText: {
    marginTop: 8,
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700'
  },
  resendButton: {
    marginTop: 20,
    alignSelf: 'center'
  },
  resendLabel: {
    color: colors.primaryDark,
    fontWeight: '700'
  },
  ctaWrap: {
    marginTop: 'auto'
  }
});
