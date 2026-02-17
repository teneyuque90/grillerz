import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { RootStackParamList } from '../../navigation/screenConfig';
import { colors } from '../../theme/colors';
import { AppSpacing } from '../../theme/grillerzTheme';
import { AppButton } from '../../ui/components/AppButton';
import { AppCard } from '../../ui/components/AppCard';
import { AppChip } from '../../ui/components/AppChip';
import { AppText } from '../../ui/components/AppText';

type Props = NativeStackScreenProps<RootStackParamList, 'Filter'>;
type RatingOption = 5 | 4 | 3;

const SORT_OPTIONS = ['Popularidad', 'Precio bajo', 'Precio alto', 'Mayor rating'] as const;
const PREFERENCE_OPTIONS = ['Disponible hoy', 'Top rated', 'Eventos grandes', 'Griller verificado'] as const;
const PRICE_MIN = 1000;
const PRICE_MAX = 10000;

function parseCurrencyValue(raw: string, fallback: number) {
  const numeric = Number(raw.replace(/[^\d]/g, ''));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-MX')}`;
}

export function FiltersScreen({ navigation }: Props) {
  const [minPriceText, setMinPriceText] = useState('1500');
  const [maxPriceText, setMaxPriceText] = useState('8000');
  const [selectedRating, setSelectedRating] = useState<RatingOption>(4);
  const [selectedSort, setSelectedSort] = useState<(typeof SORT_OPTIONS)[number]>('Popularidad');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([
    'Disponible hoy',
    'Top rated'
  ]);

  const rangeValues = useMemo(() => {
    const rawMin = parseCurrencyValue(minPriceText, 1500);
    const rawMax = parseCurrencyValue(maxPriceText, 8000);
    const normalizedMin = clamp(Math.min(rawMin, rawMax), PRICE_MIN, PRICE_MAX);
    const normalizedMax = clamp(Math.max(rawMin, rawMax), PRICE_MIN, PRICE_MAX);
    const minPercent = ((normalizedMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
    const maxPercent = ((normalizedMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

    return {
      normalizedMin,
      normalizedMax,
      minPercent,
      maxPercent
    };
  }, [maxPriceText, minPriceText]);

  function resetFilters() {
    setMinPriceText('1500');
    setMaxPriceText('8000');
    setSelectedRating(4);
    setSelectedSort('Popularidad');
    setSelectedPreferences(['Disponible hoy', 'Top rated']);
  }

  function togglePreference(preference: string) {
    setSelectedPreferences((prev) => {
      if (prev.includes(preference)) {
        return prev.filter((item) => item !== preference);
      }

      return [...prev, preference];
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader
            title="Filtros"
            onBack={() => navigation.goBack()}
            rightAction="Limpiar"
            onRightAction={resetFilters}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.section}>
              <AppText variant="section">Rango de precio</AppText>
              <AppCard style={styles.premiumCard} contentStyle={styles.cardBody}>
                <View style={styles.sliderWrap}>
                  <View style={styles.sliderTrack} />
                  <View
                    style={[
                      styles.sliderActive,
                      {
                        left: `${rangeValues.minPercent}%`,
                        width: `${Math.max(rangeValues.maxPercent - rangeValues.minPercent, 2)}%`
                      }
                    ]}
                  />
                  <View style={[styles.knob, { left: `${rangeValues.minPercent}%`, transform: [{ translateX: -10 }] }]} />
                  <View style={[styles.knob, { left: `${rangeValues.maxPercent}%`, transform: [{ translateX: -10 }] }]} />
                </View>

                <View style={styles.rangeLabels}>
                  <AppText variant="caption">{formatCurrency(rangeValues.normalizedMin)}</AppText>
                  <AppText variant="caption">{formatCurrency(rangeValues.normalizedMax)}</AppText>
                </View>

                <View style={styles.rangeInputsRow}>
                  <View style={styles.rangeInputCard}>
                    <AppText variant="caption" style={styles.inputCaption}>Min</AppText>
                    <TextInput
                      style={styles.rangeInput}
                      value={minPriceText}
                      onChangeText={setMinPriceText}
                      keyboardType="numeric"
                      placeholder="1500"
                      placeholderTextColor={colors.textSoft}
                    />
                  </View>
                  <View style={styles.rangeInputCard}>
                    <AppText variant="caption" style={styles.inputCaption}>Max</AppText>
                    <TextInput
                      style={styles.rangeInput}
                      value={maxPriceText}
                      onChangeText={setMaxPriceText}
                      keyboardType="numeric"
                      placeholder="8000"
                      placeholderTextColor={colors.textSoft}
                    />
                  </View>
                </View>
              </AppCard>
            </View>

            <View style={styles.section}>
              <AppText variant="section">Rating minimo</AppText>
              <View style={styles.chipsRow}>
                {[5, 4, 3].map((rating) => (
                  <AppChip
                    key={rating}
                    label={`${rating}.0+`}
                    selected={selectedRating === rating}
                    onPress={() => setSelectedRating(rating as RatingOption)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <AppText variant="section">Ordenar por</AppText>
              <View style={styles.optionList}>
                {SORT_OPTIONS.map((option) => {
                  const selected = option === selectedSort;
                  return (
                    <AppCard
                      key={option}
                      onPress={() => setSelectedSort(option)}
                      style={[styles.optionCard, selected ? styles.optionCardActive : null]}
                      contentStyle={styles.optionCardBody}
                    >
                      <AppText variant="body" style={selected ? styles.optionLabelActive : undefined}>
                        {option}
                      </AppText>
                      <View style={[styles.radioOuter, selected ? styles.radioOuterActive : null]}>
                        {selected ? <View style={styles.radioInner} /> : null}
                      </View>
                    </AppCard>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <AppText variant="section">Preferencias</AppText>
              <View style={styles.tagsWrap}>
                {PREFERENCE_OPTIONS.map((tag) => (
                  <AppChip
                    key={tag}
                    label={tag}
                    selected={selectedPreferences.includes(tag)}
                    onPress={() => togglePreference(tag)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <AppButton label="Aplicar filtros" variant="primary" onPress={() => navigation.navigate('Search')} />
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
    paddingHorizontal: AppSpacing.s16,
    paddingTop: AppSpacing.s16
  },
  scrollContent: {
    paddingTop: AppSpacing.s16,
    paddingBottom: 120,
    gap: AppSpacing.s24
  },
  section: {
    gap: AppSpacing.s16
  },
  premiumCard: {
    borderColor: '#F2D6D3',
    shadowOpacity: 0.1
  },
  cardBody: {
    gap: AppSpacing.s16
  },
  sliderWrap: {
    height: 28,
    justifyContent: 'center',
    position: 'relative'
  },
  sliderTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#FCE3E0'
  },
  sliderActive: {
    position: 'absolute',
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.primary
  },
  knob: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: colors.primary,
    shadowColor: '#8F1A12',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2
  },
  rangeLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rangeInputsRow: {
    flexDirection: 'row',
    gap: AppSpacing.s16
  },
  rangeInputCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  inputCaption: {
    color: colors.textSoft
  },
  rangeInput: {
    marginTop: 4,
    paddingVertical: 0,
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '800'
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.s8
  },
  optionList: {
    gap: AppSpacing.s8
  },
  optionCard: {
    borderColor: colors.border
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF7F6'
  },
  optionCardBody: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: AppSpacing.s16
  },
  optionLabelActive: {
    color: colors.primaryDark,
    fontWeight: '800'
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioOuterActive: {
    borderColor: colors.primary
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primary
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.s8
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: AppSpacing.s16,
    paddingTop: AppSpacing.s16,
    paddingBottom: AppSpacing.s16
  }
});
