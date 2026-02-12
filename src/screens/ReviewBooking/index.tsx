import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewBooking'>;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function ReviewBooking({ navigation }: Props) {
  const { selectedChef, bookingDraft, bookingSummary } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader title="Review" onBack={() => navigation.goBack()} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Detalle de reserva</Text>
              <InfoRow label="Griller" value={selectedChef.name} />
              <InfoRow label="Servicio" value={bookingDraft.mode} />
              <InfoRow label="Fecha" value={bookingDraft.dateLabel} />
              <InfoRow label="Hora" value={bookingDraft.timeLabel} />
              <InfoRow label="Direccion" value={bookingDraft.address} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Paquete</Text>
              <InfoRow label="Plan" value={bookingDraft.packageName} />
              <InfoRow label="Personas" value={`Hasta ${bookingDraft.guests}`} />
              <InfoRow label="Duracion" value={`${bookingDraft.durationHours} horas`} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Desglose</Text>
              <InfoRow label="Servicio" value={`$${bookingSummary.serviceFee}`} />
              <InfoRow label="Traslado" value={`$${bookingSummary.transferFee}`} />
              <InfoRow label="Comision app" value="$0" />
              <View style={styles.divider} />
              <InfoRow label="Total" value={`$${bookingSummary.total} MXN`} />
            </View>

            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Politica de cancelacion</Text>
              <Text style={styles.noticeText}>Cancelacion gratis hasta 24 horas antes del evento.</Text>
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Ir a pago" onPress={() => navigation.navigate('Payment')} />
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
    gap: 14
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 10
  },
  cardTitle: {
    color: colors.textStrong,
    fontSize: 17,
    fontWeight: '900'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600'
  },
  infoValue: {
    color: colors.textStrong,
    fontSize: 14,
    fontWeight: '800'
  },
  divider: {
    height: 1,
    backgroundColor: colors.border
  },
  noticeCard: {
    borderRadius: 14,
    backgroundColor: colors.backgroundMuted,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    padding: 12,
    gap: 6
  },
  noticeTitle: {
    color: colors.primaryDark,
    fontWeight: '800'
  },
  noticeText: {
    color: colors.textMuted,
    lineHeight: 20,
    fontSize: 13
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 22
  }
});
