import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomNav } from '../../components/ui/BottomNav';
import { sendPromoTestNotification } from '../../services/promoNotifications';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const todayItems = [
  { title: 'Reserva confirmada', body: 'Erick Martinez acepto tu reserva #GRZ-4831', route: 'BookingDetails' as const },
  { title: 'Nuevo mensaje', body: 'Tienes un mensaje de Carlos BBQ', route: 'Chat' as const }
];

const previousItems = [
  { title: 'Recordatorio de pago', body: 'Tu reserva de este viernes esta pagada', route: 'Bookings' as const },
  { title: 'Griller cercano', body: 'Martin Asador esta disponible hoy en tu zona', route: 'Profile' as const }
];

export function Notifications({ navigation }: Props) {
  const {
    authUser,
    promoNotificationsEnabled,
    pushPermissionStatus,
    setPromoNotificationsEnabled
  } = useAppState();
  const [feedback, setFeedback] = useState<string | null>(null);
  const isClient = authUser?.role === 'client';

  async function handleEnablePromos() {
    const result = await setPromoNotificationsEnabled(true);
    setFeedback(result.ok ? 'Notificaciones promocionales activadas.' : (result.message ?? 'No se pudieron activar.'));
  }

  async function handleDisablePromos() {
    const result = await setPromoNotificationsEnabled(false);
    setFeedback(result.ok ? 'Notificaciones promocionales desactivadas.' : (result.message ?? 'No se pudieron desactivar.'));
  }

  async function handleSendTest() {
    try {
      await sendPromoTestNotification();
      setFeedback('Notificacion de prueba enviada.');
    } catch {
      setFeedback('No se pudo enviar la prueba en este dispositivo.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader title="Notificaciones" rightAction="Limpiar" onRightAction={() => {}} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.preferencesCard}>
              <Text style={styles.preferencesTitle}>Promociones y novedades</Text>
              <Text style={styles.preferencesText}>
                {isClient
                  ? 'Recibe ofertas, disponibilidad y recomendaciones para reservar mas rapido.'
                  : 'Las promociones push se muestran en cuentas de cliente.'}
              </Text>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Estado:</Text>
                <Text style={[styles.statusValue, promoNotificationsEnabled ? styles.statusOn : styles.statusOff]}>
                  {promoNotificationsEnabled ? 'Activadas' : 'Desactivadas'}
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Permiso:</Text>
                <Text style={styles.statusValue}>
                  {pushPermissionStatus === 'granted'
                    ? 'Concedido'
                    : pushPermissionStatus === 'denied'
                      ? 'Denegado'
                      : 'Pendiente'}
                </Text>
              </View>
              <View style={styles.actionsRow}>
                <Pressable style={[styles.actionButton, styles.actionButtonPrimary]} onPress={() => void handleEnablePromos()} disabled={!isClient}>
                  <Text style={styles.actionButtonPrimaryText}>Activar</Text>
                </Pressable>
                <Pressable style={styles.actionButton} onPress={() => void handleDisablePromos()}>
                  <Text style={styles.actionButtonText}>Desactivar</Text>
                </Pressable>
                <Pressable style={styles.actionButton} onPress={() => void handleSendTest()} disabled={!isClient}>
                  <Text style={styles.actionButtonText}>Prueba</Text>
                </Pressable>
              </View>
              {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
            </View>

            <Text style={styles.sectionTitle}>Hoy</Text>
            {todayItems.map((item) => (
              <Pressable key={item.title} style={styles.item} onPress={() => navigation.navigate(item.route)}>
                <View style={styles.dot} />
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemText}>{item.body}</Text>
                </View>
                <Text style={styles.chevron}>{'>'}</Text>
              </Pressable>
            ))}

            <Text style={styles.sectionTitle}>Anteriores</Text>
            {previousItems.map((item) => (
              <Pressable key={item.title} style={styles.item} onPress={() => navigation.navigate(item.route)}>
                <View style={styles.dotMuted} />
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemText}>{item.body}</Text>
                </View>
                <Text style={styles.chevron}>{'>'}</Text>
              </Pressable>
            ))}
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
    gap: 10,
    paddingBottom: 12
  },
  preferencesCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundMuted,
    padding: 12,
    gap: 8
  },
  preferencesTitle: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '900'
  },
  preferencesText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  statusValue: {
    color: colors.textStrong,
    fontSize: 12,
    fontWeight: '800'
  },
  statusOn: {
    color: '#1C9C4D'
  },
  statusOff: {
    color: colors.primaryDark
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  actionButtonPrimary: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  actionButtonText: {
    color: colors.textStrong,
    fontSize: 12,
    fontWeight: '800'
  },
  actionButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  feedback: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  sectionTitle: {
    marginTop: 6,
    color: colors.textStrong,
    fontSize: 19,
    fontWeight: '900'
  },
  item: {
    minHeight: 78,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: colors.primary
  },
  dotMuted: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: colors.borderStrong
  },
  itemBody: {
    flex: 1,
    gap: 2
  },
  itemTitle: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '800'
  },
  itemText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  chevron: {
    color: colors.textSoft,
    fontWeight: '900'
  }
});
