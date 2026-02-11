import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Filter'>;

const sortOptions = ['Popularidad', 'Precio bajo', 'Precio alto', 'Mayor rating'];
const tags = ['Disponible hoy', 'Top rated', 'Eventos grandes', 'Chef verificado'];

export function Filter({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader title="Filtros" onBack={() => navigation.goBack()} rightAction="Limpiar" onRightAction={() => {}} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.block}>
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
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Rating minimo</Text>
              <View style={styles.ratingRow}>
                {[5, 4, 3].map((value, index) => (
                  <Pressable key={value} style={[styles.ratingChip, index === 1 ? styles.ratingChipActive : null]}>
                    <Text style={[styles.ratingText, index === 1 ? styles.ratingTextActive : null]}>{value}.0+</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Ordenar por</Text>
              <View style={styles.optionList}>
                {sortOptions.map((option, index) => (
                  <Pressable key={option} style={[styles.option, index === 0 ? styles.optionActive : null]}>
                    <Text style={[styles.optionLabel, index === 0 ? styles.optionLabelActive : null]}>{option}</Text>
                    <View style={[styles.radio, index === 0 ? styles.radioActive : null]} />
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>Preferencias</Text>
              <View style={styles.tagsWrap}>
                {tags.map((tag, index) => (
                  <Pressable key={tag} style={[styles.tag, index < 2 ? styles.tagActive : null]}>
                    <Text style={[styles.tagText, index < 2 ? styles.tagTextActive : null]}>{tag}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
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
  ratingChip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    justifyContent: 'center'
  },
  ratingChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  ratingText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13
  },
  ratingTextActive: {
    color: colors.primaryDark
  },
  optionList: {
    gap: 10
  },
  option: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
  tag: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  tagActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  tagText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12
  },
  tagTextActive: {
    color: colors.primaryDark
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 22
  }
});
