import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomNav } from '../../components/ui/BottomNav';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;
const roleLabel: Record<'client' | 'griller' | 'admin', string> = {
  client: 'Cliente',
  griller: 'Griller',
  admin: 'Admin'
};

function SectionRow({
  label,
  value,
  onPress,
  danger = false
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={[styles.rowLabel, danger ? styles.rowLabelDanger : null]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Text style={styles.chevron}>{'>'}</Text>
      </View>
    </Pressable>
  );
}

export function Settings({ navigation }: Props) {
  const { authUser, signOut } = useAppState();
  const userName = authUser?.name ?? 'Usuario Grillerz';
  const userEmail = authUser?.email ?? 'guest@grillerz.app';
  const userRole = authUser?.role ?? 'client';
  const userRoleLabel = roleLabel[userRole];

  async function handleSignOut() {
    await signOut();
    navigation.navigate('SignIn');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader
            title="Ajustes"
            rightAction="Cuenta"
            onRightAction={() => navigation.navigate('Account')}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.profileCard}>
              <View style={styles.avatar} />
              <View style={styles.profileBody}>
                <Text style={styles.name}>{userName}</Text>
                <Text style={styles.email}>{userEmail}</Text>
              </View>
              <Pressable style={styles.badge} onPress={() => navigation.navigate('Account')}>
                <Text style={styles.badgeLabel}>Editar</Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cuenta</Text>
              <SectionRow label="Informacion personal" onPress={() => navigation.navigate('Account')} />
              <SectionRow label="Rol" value={userRoleLabel} onPress={() => navigation.navigate('Account')} />
              {userRole === 'client' ? (
                <SectionRow label="Metodos de pago" value="1 tarjeta" onPress={() => navigation.navigate('Payment')} />
              ) : null}
              <SectionRow label="Direcciones" value="Casa" onPress={() => navigation.navigate('ChooseLocation')} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferencias</Text>
              <SectionRow label="Idioma" value="Espanol" onPress={() => navigation.navigate('ChooseLanguage')} />
              <SectionRow label="Favoritos" value="3 grillers" onPress={() => navigation.navigate('Favorites')} />
              <SectionRow label="Notificaciones" value="Activadas" onPress={() => navigation.navigate('Notifications')} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seguridad</Text>
              <SectionRow label="Cambiar contrasena" onPress={() => navigation.navigate('ForgotPassword')} />
              <SectionRow label="Verificacion en dos pasos" value="Activa" />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sesion</Text>
              <SectionRow label="Cerrar sesion" danger onPress={() => void handleSignOut()} />
            </View>
          </ScrollView>
        </View>

        <BottomNav activeTab="Account" onNavigate={(route) => navigation.navigate(route)} />
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
    paddingBottom: 120
  },
  scrollContent: {
    paddingTop: 12,
    gap: 16,
    paddingBottom: 16
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
    width: 56,
    height: 56,
    borderRadius: 56,
    backgroundColor: '#FFE5E2'
  },
  profileBody: {
    flex: 1,
    gap: 2
  },
  name: {
    color: colors.textStrong,
    fontSize: 17,
    fontWeight: '900'
  },
  email: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  badge: {
    minHeight: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  badgeLabel: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 12
  },
  section: {
    gap: 8
  },
  sectionTitle: {
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: '900'
  },
  row: {
    minHeight: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rowLabel: {
    color: colors.text,
    fontWeight: '700'
  },
  rowLabelDanger: {
    color: colors.primaryDark
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  rowValue: {
    color: colors.textSoft,
    fontWeight: '700',
    fontSize: 12
  },
  chevron: {
    color: colors.textSoft,
    fontWeight: '900'
  }
});
