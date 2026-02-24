import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewBooking'>;

type ParsedOrder = {
  packageName: string | null;
  dishes: Array<{ name: string; quantity: number }>;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function parseOrderSelection(rawValue: string): ParsedOrder {
  const parts = rawValue
    .split('+')
    .map((item) => item.trim())
    .filter(Boolean);

  let packageName: string | null = null;
  let dishes: Array<{ name: string; quantity: number }> = [];

  parts.forEach((part) => {
    if (part.toLowerCase().startsWith('paquete:')) {
      packageName = part.slice('paquete:'.length).trim() || null;
      return;
    }

    if (part.toLowerCase().startsWith('platillos:')) {
      const itemsRaw = part.slice('platillos:'.length).trim();
      dishes = itemsRaw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const match = item.match(/^(\d+)x\s+(.+)$/i);
          if (!match) {
            return { quantity: 1, name: item };
          }
          return {
            quantity: Number(match[1]) || 1,
            name: match[2].trim()
          };
        });
    }
  });

  if (!packageName && dishes.length === 0 && rawValue.trim()) {
    packageName = rawValue.trim();
  }

  return { packageName, dishes };
}

export function ReviewBooking({ navigation }: Props) {
  const { selectedChef, bookingDraft, bookingSummary } = useAppState();
  const parsedOrder = parseOrderSelection(bookingDraft.packageName);

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
              <Text style={styles.cardTitle}>Orden seleccionada</Text>
              {parsedOrder.packageName ? (
                <View style={styles.selectionBlock}>
                  <View style={styles.selectionHeader}>
                    <MaterialCommunityIcons name="gift-outline" size={16} color={colors.primary} />
                    <Text style={styles.selectionHeaderLabel}>Paquete</Text>
                  </View>
                  <View style={styles.selectionChip}>
                    <Text style={styles.selectionChipText}>{parsedOrder.packageName}</Text>
                  </View>
                </View>
              ) : null}

              {parsedOrder.dishes.length > 0 ? (
                <View style={styles.selectionBlock}>
                  <View style={styles.selectionHeader}>
                    <MaterialCommunityIcons name="silverware-fork-knife" size={16} color={colors.primary} />
                    <Text style={styles.selectionHeaderLabel}>Cortes y platillos</Text>
                  </View>
                  <View style={styles.selectionList}>
                    {parsedOrder.dishes.map((item) => (
                      <View key={`${item.name}-${item.quantity}`} style={styles.selectionRow}>
                        <Text style={styles.selectionRowQty}>{item.quantity}x</Text>
                        <Text style={styles.selectionRowName}>{item.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {!parsedOrder.packageName && parsedOrder.dishes.length === 0 ? (
                <Text style={styles.emptySelectionText}>No hay selección específica; se reservará servicio personalizado.</Text>
              ) : null}

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
  selectionBlock: {
    gap: 8
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  selectionHeaderLabel: {
    color: colors.textStrong,
    fontSize: 14,
    fontWeight: '800'
  },
  selectionChip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    backgroundColor: '#FFF4F2',
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  selectionChipText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '800'
  },
  selectionList: {
    gap: 6
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  selectionRowQty: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '900'
  },
  selectionRowName: {
    flex: 1,
    color: colors.textStrong,
    fontSize: 13,
    fontWeight: '700'
  },
  emptySelectionText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600'
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
