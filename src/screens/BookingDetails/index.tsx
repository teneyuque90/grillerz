import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { grillerzApi } from '../../api/grillerzApi';
import { AppCard } from '../../components/ui/AppCard';
import { AppChip } from '../../components/ui/AppChip';
import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { OFFLINE_DEMO_MODE } from '../../config/api';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { Booking, BookingStatus } from '../../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingDetails'>;

const bookingTimeline: BookingStatus[] = ['Pendiente', 'Confirmada', 'En camino', 'En servicio', 'Completada'];

function statusPalette(status: BookingStatus) {
  switch (status) {
    case 'Pendiente':
      return { text: '#B54708', bg: '#FFFAEB', border: '#FEDF89' };
    case 'Confirmada':
      return { text: '#067647', bg: '#ECFDF3', border: '#ABEFC6' };
    case 'En camino':
      return { text: '#175CD3', bg: '#EFF8FF', border: '#B2DDFF' };
    case 'En servicio':
      return { text: '#6E2A9C', bg: '#F9F5FF', border: '#D9BBFB' };
    case 'Completada':
      return { text: '#027A48', bg: '#ECFDF3', border: '#ABEFC6' };
    case 'Cancelada':
      return { text: '#B42318', bg: '#FEE4E2', border: '#FDA29B' };
    default:
      return { text: '#B54708', bg: '#FFFAEB', border: '#FEDF89' };
  }
}

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
  const [liveBooking, setLiveBooking] = useState<Booking | null>(selectedBooking);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setLiveBooking(selectedBooking);
  }, [selectedBooking]);

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (OFFLINE_DEMO_MODE || !selectedBooking) {
      return () => {
        active = false;
      };
    }

    const bookingId = selectedBooking.id;

    async function loadLatestStatus() {
      try {
        const remote = await grillerzApi.getBookingById(bookingId);
        if (!active) {
          return;
        }

        setLiveBooking(remote);
      } catch {
        // keep local fallback
      } finally {
        if (active) {
          setIsRefreshing(false);
        }
      }
    }

    setIsRefreshing(true);
    void loadLatestStatus();
    intervalId = setInterval(() => {
      void loadLatestStatus();
    }, 12000);

    return () => {
      active = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedBooking]);

  const booking = liveBooking ?? selectedBooking;

  const palette = useMemo(() => {
    if (!booking) {
      return statusPalette('Pendiente');
    }

    return statusPalette(booking.status);
  }, [booking]);

  const timelineState = useMemo(() => {
    if (!booking) {
      return bookingTimeline.map((step) => ({
        step,
        active: false,
        completed: false
      }));
    }

    if (booking.status === 'Cancelada') {
      return bookingTimeline.map((step) => ({
        step,
        active: false,
        completed: false
      }));
    }

    const currentIndex = bookingTimeline.findIndex((step) => step === booking.status);
    return bookingTimeline.map((step, index) => ({
      step,
      active: index === currentIndex,
      completed: index < currentIndex
    }));
  }, [booking]);

  if (!booking) {
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
            <AppCard style={[styles.statusCard, { borderColor: palette.border, backgroundColor: palette.bg }]}> 
              <Text style={[styles.statusLabel, { color: palette.text }]}>Estado</Text>
              <Text style={[styles.statusValue, { color: palette.text }]}>{booking.status}</Text>
              <View style={styles.statusBadgeRow}>
                <AppChip label={booking.status} selected />
              </View>
              <Text style={[styles.statusCode, { color: palette.text }]}>Codigo #{booking.id}</Text>
            </AppCard>

            <AppCard style={styles.card}>
              <Text style={styles.cardTitle}>Seguimiento</Text>
              {booking.status === 'Cancelada' ? (
                <Text style={styles.cancelledHint}>La reserva fue cancelada.</Text>
              ) : (
                <View style={styles.timelineWrap}>
                  {timelineState.map((item) => (
                    <View key={item.step} style={styles.timelineItem}>
                      <View style={[styles.timelineDot, item.active ? styles.timelineDotActive : null, item.completed ? styles.timelineDotDone : null]} />
                      <Text style={[styles.timelineLabel, item.active ? styles.timelineLabelActive : null, item.completed ? styles.timelineLabelDone : null]}>
                        {item.step}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {isRefreshing ? <Text style={styles.refreshText}>Actualizando estado...</Text> : null}
            </AppCard>

            <AppCard style={styles.card}>
              <Text style={styles.cardTitle}>Evento</Text>
              <DetailRow label="Griller" value={booking.chefName} />
              <DetailRow label="Fecha" value={booking.dateLabel} />
              <DetailRow label="Hora" value={booking.timeLabel} />
              <DetailRow label="Duracion" value={`${booking.durationHours} horas`} />
            </AppCard>

            <AppCard style={styles.card}>
              <Text style={styles.cardTitle}>Ubicacion y paquete</Text>
              <DetailRow label="Direccion" value={booking.address} />
              <DetailRow label="Plan" value={booking.packageName} />
              <DetailRow label="Personas" value={`Hasta ${booking.guests}`} />
            </AppCard>

            <AppCard style={styles.card}>
              <Text style={styles.cardTitle}>Pago</Text>
              <DetailRow label="Metodo" value={booking.paymentMethod} />
              <DetailRow label="Monto" value={`$${booking.total} MXN`} />
            </AppCard>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Contactar griller" onPress={() => navigation.navigate('Chat')} />
          <SecondaryButton label="Ver reservas" onPress={() => navigation.navigate('Bookings')} />
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
    gap: 3
  },
  statusLabel: {
    fontWeight: '700',
    fontSize: 12
  },
  statusValue: {
    fontWeight: '900',
    fontSize: 22
  },
  statusCode: {
    fontWeight: '700'
  },
  statusBadgeRow: {
    marginTop: 2,
    alignSelf: 'flex-start'
  },
  card: {
    gap: 8
  },
  cardTitle: {
    color: colors.textStrong,
    fontWeight: '900',
    fontSize: 17
  },
  timelineWrap: {
    gap: 8
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#E4E7EC'
  },
  timelineDotActive: {
    backgroundColor: colors.primary
  },
  timelineDotDone: {
    backgroundColor: '#12B76A'
  },
  timelineLabel: {
    color: colors.textSoft,
    fontWeight: '700',
    fontSize: 13
  },
  timelineLabelActive: {
    color: colors.primaryDark
  },
  timelineLabelDone: {
    color: '#027A48'
  },
  cancelledHint: {
    color: '#B42318',
    fontWeight: '700'
  },
  refreshText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
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
