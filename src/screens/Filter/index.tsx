import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppCard } from '../../components/ui/AppCard';
import { AppChip } from '../../components/ui/AppChip';
import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Filter'>;

const sortOptions = ['Popularidad', 'Precio bajo', 'Precio alto', 'Mayor rating'];
const tags = ['Disponible hoy', 'Top rated', 'Eventos grandes', 'Griller verificado'];
const ratingOptions = [5, 4, 3];

export function Filter({ navigation }: Props) {
  const [selectedRating, setSelectedRating] = useState(4);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [activeTags, setActiveTags] = useState<string[]>(tags.slice(0, 2));

  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      }

      return [...prev, tag];
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader title="Filtros" onBack={() => navigation.goBack()} rightAction="Limpiar" onRightAction={() => {}} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <AppCard style={styles.sectionCard}>
              <Text style={styles.blockTitle}>Rango de precio</Text>
              <View style={styles.sliderMock}>
                <View style={styles.sliderFill} />
                <View style={[styles.knob, styles.knobLeft]} />
                <View style={[styles.knob, styles.knobRight]} />
              </View>
              <View style={styles.rangeRow}>
                <Text style={styles.rangeValue}>$1,500</Text>
                <Text style={styles.rangeValue}>$8,000</Text>
              </View>
            </AppCard>

            <AppCard style={styles.sectionCard}>
              <Text style={styles.blockTitle}>Rating minimo</Text>
              <View style={styles.ratingRow}>
                {ratingOptions.map((value) => (
                  <AppChip
                    key={value}
                    label={`${value}.0+`}
                    selected={value === selectedRating}
                    onPress={() => setSelectedRating(value)}
                  />
                ))}
              </View>
            </AppCard>

            <AppCard style={styles.sectionCard}>
              <Text style={styles.blockTitle}>Ordenar por</Text>
              <View style={styles.optionList}>
                {sortOptions.map((option) => (
                  <AppCard key={option} padded={false} onPress={() => setSelectedSort(option)} style={[styles.option, selectedSort === option ? styles.optionActive : null]}>
                    <Text style={[styles.optionLabel, selectedSort === option ? styles.optionLabelActive : null]}>{option}</Text>
                    <View style={[styles.radio, selectedSort === option ? styles.radioActive : null]} />
                  </AppCard>
                ))}
              </View>
            </AppCard>

            <AppCard style={styles.sectionCard}>
              <Text style={styles.blockTitle}>Preferencias</Text>
              <View style={styles.tagsWrap}>
                {tags.map((tag) => (
                  <AppChip key={tag} label={tag} selected={activeTags.includes(tag)} onPress={() => toggleTag(tag)} />
                ))}
              </View>
            </AppCard>
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Aplicar filtros" onPress={() => navigation.navigate('Search')} />
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
    paddingTop: 16,
    paddingBottom: 20,
    gap: 20
  },
  block: {
    gap: 10
  },
  sectionCard: {
    gap: 10
  },
  blockTitle: {
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: '900'
  },
  sliderMock: {
    marginTop: 4,
    height: 30,
    justifyContent: 'center'
  },
  sliderFill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.primarySoft
  },
  knob: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  knobLeft: {
    left: 28
  },
  knobRight: {
    right: 34
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rangeValue: {
    color: colors.textMuted,
    fontWeight: '700'
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8
  },
  optionList: {
    gap: 10
  },
  option: {
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
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
  radio: {
    width: 18,
    height: 18,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.borderStrong
  },
  radioActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 22
  }
});
