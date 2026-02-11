import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../navigation/screenConfig';
import { BottomNav } from '../../components/ui/BottomNav';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Browse01'>;

const chefs = [
  { name: 'Ribeye Jugoso', chef: 'Cories BBQ', chefId: 'cories-bbq', price: '$2,800' },
  { name: 'Asado Regio', chef: 'Luis BBQ', chefId: 'luis-bbq', price: '$3,200' },
  { name: 'Costillas Ahumadas', chef: 'Martin Asador', chefId: 'martin-asador', price: '$3,600' }
];

export function Browse01({ navigation }: Props) {
  const { selectChef } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>populares en tu zona</Text>
            <Pressable onPress={() => navigation.navigate('Search')}>
              <Text style={styles.search}>Buscar</Text>
            </Pressable>
          </View>

          <LinearGradient colors={[colors.flameEnd, colors.flameStart]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
            <Text style={styles.heroLabel}>Costillas a la Parrilla</Text>
            <Text style={styles.heroSub}>Nuetina Baedo  -  Nuevo Laredo</Text>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recomendados</Text>
            <Pressable onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.link}>Ver todo</Text>
            </Pressable>
          </View>

          <View style={styles.list}>
            {chefs.map((item) => (
              <Pressable
                key={item.name}
                style={styles.item}
                onPress={() => {
                  selectChef(item.chefId);
                  navigation.navigate('Profile');
                }}
              >
                <View style={styles.itemThumb}>
                  <LinearGradient colors={['#FFD8CF', '#FFF1EE']} style={StyleSheet.absoluteFill} />
                </View>
                <View style={styles.itemBody}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemChef}>{item.chef}</Text>
                </View>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.hireButton}
            onPress={() => {
              selectChef(chefs[0].chefId);
              navigation.navigate('Schedule');
            }}
          >
            <Text style={styles.hireLabel}>Contratar al Parrillero</Text>
          </Pressable>
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
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 120
  },
  headerRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    color: colors.textStrong,
    maxWidth: 250
  },
  search: {
    color: colors.primary,
    fontWeight: '800'
  },
  heroCard: {
    marginTop: 18,
    minHeight: 196,
    borderRadius: 18,
    justifyContent: 'flex-end',
    padding: 16
  },
  heroLabel: {
    color: '#FFFFFF',
    fontSize: 31,
    lineHeight: 34,
    fontWeight: '900'
  },
  heroSub: {
    marginTop: 6,
    color: '#FFD9D3',
    fontWeight: '600'
  },
  sectionHeader: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textStrong
  },
  link: {
    color: colors.primary,
    fontWeight: '700'
  },
  list: {
    marginTop: 12,
    gap: 12
  },
  item: {
    minHeight: 94,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  itemThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden'
  },
  itemBody: {
    flex: 1,
    gap: 4
  },
  itemName: {
    color: colors.textStrong,
    fontSize: 17,
    fontWeight: '800'
  },
  itemChef: {
    color: colors.textMuted,
    fontWeight: '600'
  },
  itemPrice: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 16
  },
  hireButton: {
    marginTop: 16,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  hireLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  }
});
