import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAppState } from '../../state/AppStateContext';
import { ServiceMode } from '../../types/domain';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Schedule'>;

const dayOptions = ['Viernes 12 Abril 2026', 'Sabado 13 Abril 2026', 'Domingo 14 Abril 2026', 'Lunes 15 Abril 2026'];
const timeOptions = ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'];
const modes: ServiceMode[] = ['A domicilio', 'En terraza del griller'];

function shortenDateLabel(label: string): string {
  return label
    .replace('Viernes ', 'Vie ')
    .replace('Sabado ', 'Sab ')
    .replace('Domingo ', 'Dom ')
    .replace('Lunes ', 'Lun ')
    .replace(' Abril 2026', '');
}

export function Schedule({ navigation }: Props) {
  const { selectedChef, bookingDraft, bookingSummary, updateBookingDraft } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader title="Agenda" onBack={() => navigation.goBack()} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryAvatar} />
              <View style={styles.summaryBody}>
                <Text style={styles.summaryName}>{selectedChef.name}</Text>
                <Text style={styles.summaryMeta}>{selectedChef.title}</Text>
              </View>
              <Text style={styles.summaryRate}>${selectedChef.basePrice}</Text>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Fecha</Text>
              <View style={styles.chipRow}>
                {dayOptions.map((day) => {
                  const active = bookingDraft.dateLabel === day;

                  return (
                    <Pressable key={day} style={[styles.chip, active ? styles.chipActive : null]} onPress={() => updateBookingDraft({ dateLabel: day })}>
                      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{shortenDateLabel(day)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Horario</Text>
              <View style={styles.chipRow}>
                {timeOptions.map((slot) => {
                  const active = bookingDraft.timeLabel === slot;

                  return (
                    <Pressable key={slot} style={[styles.chip, active ? styles.chipActive : null]} onPress={() => updateBookingDraft({ timeLabel: slot })}>
                      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{slot}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Modalidad</Text>
              {modes.map((mode) => {
                const active = bookingDraft.mode === mode;

                return (
                  <Pressable key={mode} style={[styles.option, active ? styles.optionActive : null]} onPress={() => updateBookingDraft({ mode })}>
                    <Text style={[styles.optionLabel, active ? styles.optionLabelActive : null]}>{mode}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Direccion</Text>
              <View style={styles.addressCard}>
                <Text style={styles.addressLine}>{bookingDraft.address.split(',')[0]}</Text>
                <Text style={styles.addressSub}>{bookingDraft.address.split(',').slice(1).join(',').trim()}</Text>
              </View>
            </View>

            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total estimado</Text>
              <Text style={styles.totalValue}>${bookingSummary.total} MXN</Text>
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Continuar" onPress={() => navigation.navigate('ReviewBooking')} />
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
  summaryCard: {
    minHeight: 86,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.backgroundMuted
  },
  summaryAvatar: {
    width: 48,
    height: 48,
    borderRadius: 48,
    backgroundColor: '#FFE5E2'
  },
  summaryBody: {
    flex: 1,
    gap: 2
  },
  summaryName: {
    color: colors.textStrong,
    fontWeight: '800',
    fontSize: 16
  },
  summaryMeta: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 13
  },
  summaryRate: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 16
  },
  block: {
    gap: 10
  },
  blockTitle: {
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: '900'
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  chipText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13
  },
  chipTextActive: {
    color: colors.primaryDark
  },
  option: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundMuted
  },
  optionLabel: {
    color: colors.text,
    fontWeight: '700'
  },
  optionLabelActive: {
    color: colors.primaryDark
  },
  addressCard: {
    minHeight: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: colors.backgroundMuted
  },
  addressLine: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '800'
  },
  addressSub: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  totalCard: {
    minHeight: 72,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  totalLabel: {
    color: colors.textMuted,
    fontWeight: '700'
  },
  totalValue: {
    marginTop: 4,
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 28
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 22
  }
});
