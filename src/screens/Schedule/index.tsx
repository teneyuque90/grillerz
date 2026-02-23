import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ReliableImage } from '../../components/ui/ReliableImage';
import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { getLocalAvatarUriByChef } from '../../data/localMedia';
import { useAppState } from '../../state/AppStateContext';
import { ServiceMode } from '../../types/domain';
import { colors } from '../../theme/colors';
import { getChefAvatarUrl } from '../../utils/chefMedia';

type Props = NativeStackScreenProps<RootStackParamList, 'Schedule'>;
type DateOption = {
  key: string;
  label: string;
  shortLabel: string;
  monthKey: string;
  monthLabel: string;
  weekday: number;
  isSpecial: boolean;
};

const modes: ServiceMode[] = ['A domicilio', 'En terraza del griller'];

const monthLabels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const weekdayLabels = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
const weekdayShort = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

function buildDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildDateLabel(date: Date): string {
  const weekday = weekdayLabels[date.getDay()];
  const month = monthLabels[date.getMonth()];
  return `${weekday} ${date.getDate()} ${month} ${date.getFullYear()}`;
}

function buildShortDateLabel(date: Date): string {
  const shortWeekday = weekdayShort[date.getDay()] ?? weekdayLabels[date.getDay()].slice(0, 3);
  const day = date.getDate();
  const shortMonth = monthLabels[date.getMonth()].slice(0, 3);
  return `${shortWeekday} ${day} ${shortMonth}`;
}

function buildMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
}

function buildMonthLabel(date: Date): string {
  const month = monthLabels[date.getMonth()];
  return `${month} ${date.getFullYear()}`;
}

function isValidDateKey(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return false;
  }

  const [yearRaw, monthRaw, dayRaw] = trimmed.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day;
}

export function Schedule({ navigation }: Props) {
  const { selectedChef, bookingDraft, bookingSummary, updateBookingDraft } = useAppState();
  const [showAllDates, setShowAllDates] = useState(false);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('all');
  const avatarUrl = getChefAvatarUrl(selectedChef);
  const avatarFallbackUrl = getLocalAvatarUriByChef(selectedChef.id);

  const availability = selectedChef.availability ?? {
    weekdays: [1, 2, 3, 4, 5, 6, 0],
    times: ['6:00 PM', '7:00 PM', '8:00 PM'],
    blockedDates: [],
    specialDates: []
  };

  const blockedDatesSet = useMemo(() => {
    const blocked = (availability.blockedDates ?? [])
      .map((item) => String(item).trim())
      .filter((item) => isValidDateKey(item));

    return new Set(blocked);
  }, [availability.blockedDates]);

  const specialDateTimesMap = useMemo(() => {
    const entries = (availability.specialDates ?? [])
      .map((item) => ({
        date: String(item?.date ?? '').trim(),
        times: Array.isArray(item?.times)
          ? item.times.map((time) => String(time).trim()).filter(Boolean).slice(0, 16)
          : []
      }))
      .filter((item) => isValidDateKey(item.date) && item.times.length > 0);

    const map = new Map<string, string[]>();
    entries.forEach((item) => {
      map.set(item.date, Array.from(new Set(item.times)));
    });

    return map;
  }, [availability.specialDates]);

  const dateOptions = useMemo(() => {
    const options: DateOption[] = [];
    const start = new Date();
    let offset = 0;

    while (options.length < 70 && offset < 160) {
      const candidate = new Date(start);
      candidate.setDate(start.getDate() + offset);
      const dateKey = buildDateKey(candidate);
      const hasSpecialTimes = specialDateTimesMap.has(dateKey);
      const isOpenByDefault = availability.weekdays.includes(candidate.getDay()) && !blockedDatesSet.has(dateKey);

      if (isOpenByDefault || hasSpecialTimes) {
        options.push({
          key: dateKey,
          label: buildDateLabel(candidate),
          shortLabel: buildShortDateLabel(candidate),
          monthKey: buildMonthKey(candidate),
          monthLabel: buildMonthLabel(candidate),
          weekday: candidate.getDay(),
          isSpecial: hasSpecialTimes
        });
      }

      offset += 1;
    }

    return options;
  }, [availability.weekdays, blockedDatesSet, specialDateTimesMap]);

  const monthOptions = useMemo(() => {
    const map = new Map<string, string>();

    dateOptions.forEach((option) => {
      if (!map.has(option.monthKey)) {
        map.set(option.monthKey, option.monthLabel);
      }
    });

    return [{ key: 'all', label: 'Todas' }, ...Array.from(map.entries()).map(([key, label]) => ({ key, label }))];
  }, [dateOptions]);

  const filteredDateOptions = useMemo(() => {
    if (selectedMonthKey === 'all') {
      return dateOptions;
    }

    return dateOptions.filter((option) => option.monthKey === selectedMonthKey);
  }, [dateOptions, selectedMonthKey]);

  const selectedDateOption = useMemo(() => {
    return dateOptions.find((option) => option.label === bookingDraft.dateLabel) ?? null;
  }, [bookingDraft.dateLabel, dateOptions]);

  const timeOptions = useMemo(() => {
    if (!selectedDateOption || selectedDateOption.key === '') {
      return availability.times;
    }

    return specialDateTimesMap.get(selectedDateOption.key) ?? availability.times;
  }, [availability.times, selectedDateOption, specialDateTimesMap]);

  const visibleDateOptions = showAllDates ? filteredDateOptions : filteredDateOptions.slice(0, 12);

  useEffect(() => {
    setShowAllDates(false);
    setSelectedMonthKey('all');
  }, [selectedChef.id]);

  useEffect(() => {
    if (!dateOptions.some((option) => option.label === bookingDraft.dateLabel) && dateOptions.length > 0) {
      updateBookingDraft({ dateLabel: dateOptions[0].label });
    }
  }, [bookingDraft.dateLabel, dateOptions, updateBookingDraft]);

  useEffect(() => {
    if (selectedMonthKey === 'all') {
      return;
    }

    if (!filteredDateOptions.some((option) => option.label === bookingDraft.dateLabel) && filteredDateOptions.length > 0) {
      updateBookingDraft({ dateLabel: filteredDateOptions[0].label });
    }
  }, [bookingDraft.dateLabel, filteredDateOptions, selectedMonthKey, updateBookingDraft]);

  useEffect(() => {
    if (!timeOptions.includes(bookingDraft.timeLabel) && timeOptions.length > 0) {
      updateBookingDraft({ timeLabel: timeOptions[0] });
    }
  }, [bookingDraft.timeLabel, timeOptions, updateBookingDraft]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader title="Agenda" onBack={() => navigation.goBack()} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.summaryCard}>
              <ReliableImage uri={avatarUrl} fallbackUri={avatarFallbackUrl} style={styles.summaryAvatar} />
              <View style={styles.summaryBody}>
                <Text style={styles.summaryName}>{selectedChef.name}</Text>
                <Text style={styles.summaryMeta}>{selectedChef.title}</Text>
              </View>
              <Text style={styles.summaryRate}>${bookingSummary.serviceFee}</Text>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Fecha</Text>
              <Text style={styles.helperText}>Disponibilidad real segun calendario del griller.</Text>
              <Text style={styles.helperText}>Se excluyen fechas bloqueadas y se priorizan horarios especiales.</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthScrollRow}>
                {monthOptions.map((month) => {
                  const active = selectedMonthKey === month.key;

                  return (
                    <Pressable
                      key={month.key}
                      style={[styles.monthChip, active ? styles.chipActive : null]}
                      onPress={() => {
                        setSelectedMonthKey(month.key);
                        setShowAllDates(false);
                      }}
                    >
                      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{month.label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScrollRow}>
                {visibleDateOptions.map((option) => {
                  const active = bookingDraft.dateLabel === option.label;

                  return (
                    <Pressable
                      key={option.key}
                      style={[styles.dateChip, option.isSpecial ? styles.dateChipSpecial : null, active ? styles.chipActive : null]}
                      onPress={() => updateBookingDraft({ dateLabel: option.label })}
                    >
                      <Text style={[styles.chipText, active ? styles.chipTextActive : option.isSpecial ? styles.chipTextSpecial : null]}>
                        {option.shortLabel}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              {visibleDateOptions.length === 0 ? <Text style={styles.emptyState}>No hay fechas para este mes.</Text> : null}
              {selectedDateOption?.isSpecial ? (
                <Text style={styles.specialDateNotice}>Horario especial del griller para esta fecha.</Text>
              ) : null}
              {filteredDateOptions.length > 12 ? (
                <Pressable style={styles.moreDatesBtn} onPress={() => setShowAllDates((prev) => !prev)}>
                  <Text style={styles.moreDatesLabel}>{showAllDates ? 'Ver menos fechas' : 'Ver mas fechas'}</Text>
                </Pressable>
              ) : null}
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
              {timeOptions.length === 0 ? <Text style={styles.emptyState}>No hay horarios disponibles para la fecha seleccionada.</Text> : null}
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
  helperText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '600'
  },
  blockTitle: {
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: '900'
  },
  dateScrollRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20
  },
  monthScrollRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20
  },
  monthChip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  dateChip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  dateChipSpecial: {
    borderColor: '#FBBF24',
    backgroundColor: '#FFFBEB'
  },
  emptyState: {
    color: colors.textSoft,
    fontWeight: '600',
    fontSize: 12
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
  chipTextSpecial: {
    color: '#92400E'
  },
  specialDateNotice: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: 12
  },
  moreDatesBtn: {
    alignSelf: 'flex-start',
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    justifyContent: 'center'
  },
  moreDatesLabel: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12
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
