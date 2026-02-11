import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../navigation/screenConfig';
import { BottomNav } from '../../components/ui/BottomNav';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Browse02'>;

const categoryChips = ['Asado Regio', 'Tomahawk', 'Costillas', 'Parrilla Mixta', 'Veggie Grill'];
const featured = [
  { title: 'Plan Familiar', subtitle: 'Hasta 10 personas', price: '$5,500', chefId: 'carlos-bbq' },
  { title: 'Plan Premium', subtitle: 'Evento completo', price: '$8,900', chefId: 'erick-martinez' }
];

export function Browse02({ navigation }: Props) {
  const { selectChef } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.kicker}>Nuevo Laredo</Text>
              <Text style={styles.title}>elige tu estilo</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('Map')} style={styles.mapAction}>
              <Text style={styles.mapActionLabel}>Mapa</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {categoryChips.map((chip, index) => (
              <Pressable
                key={chip}
                style={[styles.chip, index === 0 ? styles.chipActive : null]}
                onPress={() => navigation.navigate('Categories')}
              >
                <Text style={[styles.chipText, index === 0 ? styles.chipTextActive : null]}>{chip}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <LinearGradient colors={['#1C0E0A', '#FF4D2D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
            <Text style={styles.heroTitle}>Master Grill Week</Text>
            <Text style={styles.heroSubtitle}>Reserva hoy y obten 15% en tu primer evento.</Text>
            <Pressable style={styles.heroButton} onPress={() => navigation.navigate('Browse03')}>
              <Text style={styles.heroButtonLabel}>Ver experiencias</Text>
            </Pressable>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Paquetes destacados</Text>
            <Pressable onPress={() => navigation.navigate('Filter')}>
              <Text style={styles.link}>Filtrar</Text>
            </Pressable>
          </View>

          <View style={styles.cardsWrap}>
            {featured.map((item) => (
              <Pressable
                key={item.title}
                style={styles.packageCard}
                onPress={() => {
                  selectChef(item.chefId);
                  navigation.navigate('Profile');
                }}
              >
                <View style={styles.packageThumb} />
                <Text style={styles.packageTitle}>{item.title}</Text>
                <Text style={styles.packageSubtitle}>{item.subtitle}</Text>
                <Text style={styles.packagePrice}>{item.price} MXN</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <BottomNav activeTab="Browse01" onNavigate={(route) => navigation.navigate(route)} />
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  kicker: {
    color: colors.textMuted,
    fontWeight: '700'
  },
  title: {
    marginTop: 4,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    color: colors.textStrong
  },
  mapAction: {
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mapActionLabel: {
    color: colors.primary,
    fontWeight: '800'
  },
  chipsRow: {
    marginTop: 18,
    gap: 8,
    paddingRight: 20
  },
  chip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background
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
  heroCard: {
    marginTop: 18,
    borderRadius: 20,
    padding: 18,
    minHeight: 200,
    justifyContent: 'flex-end'
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900'
  },
  heroSubtitle: {
    marginTop: 6,
    color: '#FFD9D3',
    maxWidth: 260,
    lineHeight: 20
  },
  heroButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    minHeight: 38,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center'
  },
  heroButtonLabel: {
    color: colors.primaryDark,
    fontWeight: '800'
  },
  sectionHeader: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    color: colors.textStrong,
    fontSize: 22,
    fontWeight: '900'
  },
  link: {
    color: colors.primary,
    fontWeight: '800'
  },
  cardsWrap: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 12
  },
  packageCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 6
  },
  packageThumb: {
    height: 86,
    borderRadius: 10,
    backgroundColor: '#FFE5E2'
  },
  packageTitle: {
    color: colors.textStrong,
    fontWeight: '800',
    fontSize: 16
  },
  packageSubtitle: {
    color: colors.textMuted,
    fontSize: 13
  },
  packagePrice: {
    marginTop: 2,
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 15
  }
});
