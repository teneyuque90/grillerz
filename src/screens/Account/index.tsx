import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomNav } from '../../components/ui/BottomNav';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export function Account({ navigation }: Props) {
  const { authUser } = useAppState();
  const userName = authUser?.name ?? 'Usuario Grillerz';
  const userEmail = authUser?.email ?? 'guest@grillerz.app';
  const userPhone = authUser?.phone ?? '+52 867 000 0000';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader
            title="Cuenta"
            onBack={() => navigation.goBack()}
            rightAction="Ajustes"
            onRightAction={() => navigation.navigate('Settings')}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.profileCard}>
              <View style={styles.avatar} />
              <View style={styles.profileBody}>
                <Text style={styles.profileName}>{userName}</Text>
                <Text style={styles.profileEmail}>{userEmail}</Text>
              </View>
              <Pressable style={styles.editChip}>
                <Text style={styles.editChipLabel}>Editar</Text>
              </Pressable>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Informacion personal</Text>
              <Field label="Nombre" value={userName} />
              <Field label="Telefono" value={userPhone} />
              <Field label="Correo" value={userEmail} />
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Direccion principal</Text>
              <View style={styles.cardRow}>
                <View>
                  <Text style={styles.cardTitle}>Casa</Text>
                  <Text style={styles.cardText}>Guanajuato 254, Nuevo Laredo</Text>
                </View>
                <Text style={styles.link}>{'>'}</Text>
              </View>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Metodos de pago</Text>
              <View style={styles.cardRow}>
                <View>
                  <Text style={styles.cardTitle}>Visa terminacion 3902</Text>
                  <Text style={styles.cardText}>Default  -  Exp 10/29</Text>
                </View>
                <Text style={styles.link}>{'>'}</Text>
              </View>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Seguridad</Text>
              <View style={styles.securityRow}>
                <Text style={styles.securityLabel}>Verificacion en dos pasos</Text>
                <Text style={styles.statusOn}>ACTIVA</Text>
              </View>
              <View style={styles.securityRow}>
                <Text style={styles.securityLabel}>Biometria</Text>
                <Text style={styles.statusOn}>ACTIVA</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Guardar cambios" onPress={() => navigation.navigate('Settings')} />
        </View>

        <BottomNav activeTab="Settings" onNavigate={(route) => navigation.navigate(route)} />
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 190
  },
  scrollContent: {
    paddingTop: 12,
    gap: 16,
    paddingBottom: 14
  },
  profileCard: {
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.backgroundMuted
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 58,
    backgroundColor: '#FFE5E2'
  },
  profileBody: {
    flex: 1,
    gap: 2
  },
  profileName: {
    color: colors.textStrong,
    fontSize: 17,
    fontWeight: '900'
  },
  profileEmail: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  editChip: {
    minHeight: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: colors.primarySoft
  },
  editChipLabel: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 12
  },
  block: {
    gap: 10
  },
  blockTitle: {
    color: colors.textStrong,
    fontSize: 19,
    fontWeight: '900'
  },
  field: {
    minHeight: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center',
    gap: 2
  },
  fieldLabel: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700'
  },
  fieldValue: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '700'
  },
  cardRow: {
    minHeight: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  cardTitle: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '800'
  },
  cardText: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  link: {
    color: colors.textSoft,
    fontWeight: '900'
  },
  securityRow: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  securityLabel: {
    color: colors.text,
    fontWeight: '700'
  },
  statusOn: {
    color: '#067647',
    fontWeight: '800',
    fontSize: 12
  },
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 100
  }
});
