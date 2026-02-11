import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingDetails'>;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function BookingDetails({ navigation }: Props) {
  const { selectedBooking } = useAppState();

  if (!selectedBooking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.screen, styles.emptyState]}>
          <Text style={styles.emptyTitle}>No hay reserva seleccionada</Text>
          <PrimaryButton label="Ir a reservas" onPress={() => navigation.navigate('Bookings')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader
            title="Detalle"
            onBack={() => navigation.goBack()}
            rightAction="Chat"
            onRightAction={() => navigation.navigate('Chat')}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Estado</Text>
              <Text style={styles.statusValue}>{selectedBooking.status}</Text>
              <Text style={styles.statusCode}>Codigo #{selectedBooking.id}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Evento</Text>
              <DetailRow label="Chef" value={selectedBooking.chefName} />
              <DetailRow label="Fecha" value={selectedBooking.dateLabel} />
              <DetailRow label="Hora" value={selectedBooking.timeLabel} />
              <DetailRow label="Duracion" value={`${selectedBooking.durationHours} horas`} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ubicacion y paquete</Text>
              <DetailRow label="Direccion" value={selectedBooking.address} />
              <DetailRow label="Plan" value={selectedBooking.packageName} />
              <DetailRow label="Personas" value={`Hasta ${selectedBooking.guests}`} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pago</Text>
              <DetailRow label="Metodo" value={selectedBooking.paymentMethod} />
              <DetailRow label="Monto" value={`$${selectedBooking.total} MXN`} />
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Contactar chef" onPress={() => navigation.navigate('Chat')} />
          <Pressable style={styles.secondary} onPress={() => navigation.navigate('Schedule')}>
            <Text style={styles.secondaryLabel}>Reagendar</Text>
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
    backgroundColor: colors.background
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12
  },
  statusCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ABEFC6',
    backgroundColor: '#ECFDF3',
    padding: 12,
    gap: 3
  },
  statusLabel: {
    color: '#067647',
    fontWeight: '700',
    fontSize: 12
  },
  statusValue: {
    color: '#067647',
    fontWeight: '900',
    fontSize: 22
  },
  statusCode: {
    color: '#067647',
    fontWeight: '700'
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 8
  },
  cardTitle: {
    color: colors.textStrong,
    fontWeight: '900',
    fontSize: 17
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10
  },
  rowLabel: {
    color: colors.textMuted,
    fontWeight: '600'
  },
  rowValue: {
    color: colors.textStrong,
    fontWeight: '800'
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 10
  },
  secondary: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryLabel: {
    color: colors.textStrong,
    fontWeight: '800'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12
  },
  emptyTitle: {
    color: colors.textStrong,
    fontSize: 20,
    fontWeight: '900'
  }
});
