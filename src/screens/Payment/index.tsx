import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAppState } from '../../state/AppStateContext';
import { PaymentMethod } from '../../types/domain';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

const methods: PaymentMethod[] = ['Tarjeta', 'Transferencia', 'Efectivo'];

export function Payment({ navigation }: Props) {
  const { selectedChef, bookingSummary, confirmBooking, eventCheckout, completeEventCheckout, clearEventCheckout } = useAppState();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tarjeta');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const isEventPayment = Boolean(eventCheckout);
  const eventSeatsTotal = eventCheckout?.seatsTotal ?? eventCheckout?.total ?? 0;
  const eventAddOnsTotal = eventCheckout?.addOnsTotal ?? 0;
  const payableService = isEventPayment ? eventSeatsTotal : bookingSummary.serviceFee;
  const payableTransfer = isEventPayment ? 0 : bookingSummary.transferFee;
  const payableTotal = isEventPayment ? eventCheckout?.total ?? eventSeatsTotal + eventAddOnsTotal : bookingSummary.total;

  async function handlePay() {
    if (isPaying) {
      return;
    }

    setIsPaying(true);
    setPaymentError(null);
    try {
      if (eventCheckout) {
        await completeEventCheckout(paymentMethod);
      } else {
        await confirmBooking(paymentMethod);
      }
      navigation.navigate('Success');
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'No se pudo procesar el pago.');
    }
    setIsPaying(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader title="Pago" onBack={() => navigation.goBack()} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Metodo de pago</Text>
              <View style={styles.methodRow}>
                {methods.map((method) => {
                  const active = paymentMethod === method;

                  return (
                    <Pressable key={method} style={[styles.methodChip, active ? styles.methodChipActive : null]} onPress={() => setPaymentMethod(method)}>
                      <Text style={[styles.methodText, active ? styles.methodTextActive : null]}>{method}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.cardPreview}>
              <Text style={styles.cardBrand}>{paymentMethod === 'Tarjeta' ? 'VISA' : paymentMethod.toUpperCase()}</Text>
              <Text style={styles.cardNumber}>{paymentMethod === 'Tarjeta' ? '**** **** **** 3902' : 'Pago directo en proceso'}</Text>
              <View style={styles.cardMetaRow}>
                <Text style={styles.cardMeta}>Griller: {isEventPayment ? eventCheckout?.event.chefName : selectedChef.name}</Text>
                <Text style={styles.cardMeta}>Total: ${payableTotal}</Text>
              </View>
              {isEventPayment ? (
                <Text style={styles.cardMeta}>
                  Evento: {eventCheckout?.event.title} · {eventCheckout?.seats} lugar(es)
                </Text>
              ) : null}
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Resumen de cobro</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{isEventPayment ? 'Evento' : 'Servicio'}</Text>
                  <Text style={styles.summaryValue}>${payableService}</Text>
                </View>
                {isEventPayment && eventAddOnsTotal > 0 ? (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Extras menu</Text>
                    <Text style={styles.summaryValue}>${eventAddOnsTotal}</Text>
                  </View>
                ) : null}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Traslado</Text>
                  <Text style={styles.summaryValue}>${payableTransfer}</Text>
                </View>
                {isEventPayment && (eventCheckout?.addOns?.length ?? 0) > 0 ? (
                  <View style={styles.eventAddOnsList}>
                    {eventCheckout?.addOns.map((item) => (
                      <View key={item.id} style={styles.eventAddOnRow}>
                        <Text style={styles.eventAddOnLabel}>{item.quantity}x {item.name}</Text>
                        <Text style={styles.eventAddOnValue}>${item.total}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Descuento</Text>
                  <Text style={styles.summaryValue}>$0</Text>
                </View>
                <View style={styles.line} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabelStrong}>Total</Text>
                  <Text style={styles.summaryValueStrong}>${payableTotal} MXN</Text>
                </View>
              </View>
              {isEventPayment ? (
                <Pressable onPress={clearEventCheckout}>
                  <Text style={styles.eventCancelLink}>Cancelar checkout de evento</Text>
                </Pressable>
              ) : null}
              {paymentError ? <Text style={styles.paymentError}>{paymentError}</Text> : null}
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label={isPaying ? 'Procesando...' : 'Pagar ahora'} onPress={handlePay} />
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
    gap: 18
  },
  block: {
    gap: 10
  },
  blockTitle: {
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: '900'
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8
  },
  methodChip: {
    flex: 1,
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  methodChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  methodText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700'
  },
  methodTextActive: {
    color: colors.primaryDark
  },
  cardPreview: {
    minHeight: 180,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#15171C',
    justifyContent: 'space-between'
  },
  cardBrand: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900'
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: 1,
    fontWeight: '800'
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  cardMeta: {
    color: '#98A2B3',
    fontSize: 12,
    fontWeight: '700'
  },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 8
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryLabel: {
    color: colors.textMuted,
    fontWeight: '600'
  },
  summaryValue: {
    color: colors.textStrong,
    fontWeight: '700'
  },
  line: {
    height: 1,
    backgroundColor: colors.border
  },
  summaryLabelStrong: {
    color: colors.textStrong,
    fontWeight: '900'
  },
  summaryValueStrong: {
    color: colors.primaryDark,
    fontWeight: '900'
  },
  eventAddOnsList: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundMuted,
    padding: 8,
    gap: 6
  },
  eventAddOnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  eventAddOnLabel: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  eventAddOnValue: {
    color: colors.textStrong,
    fontSize: 12,
    fontWeight: '800'
  },
  eventCancelLink: {
    marginTop: 10,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800'
  },
  paymentError: {
    marginTop: 10,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700'
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 22
  }
});
