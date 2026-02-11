import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { BottomNav } from '../../components/ui/BottomNav';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

const nearby = [
  { name: 'Martin Asador', chefId: 'martin-asador', eta: '15 min', city: 'Nuevo Laredo' },
  { name: 'Luis BBQ', chefId: 'luis-bbq', eta: '22 min', city: 'Nuevo Laredo' },
  { name: 'Carlos BBQ', chefId: 'carlos-bbq', eta: '30 min', city: 'Monterrey' }
];

export function Map({ navigation }: Props) {
  const { selectChef } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.searchBar}>
          <Text style={styles.searchText}>Buscar chef o direccion...</Text>
          <Pressable onPress={() => navigation.navigate('Filter')}>
            <Text style={styles.filterText}>Filtro</Text>
          </Pressable>
        </View>

        <View style={styles.mapMock}>
          <View style={styles.routeA} />
          <View style={styles.routeB} />
          <View style={[styles.pin, styles.pinOne]} />
          <View style={[styles.pin, styles.pinTwo]} />
          <View style={[styles.pin, styles.pinThree]} />
          <View style={[styles.pin, styles.pinFour]} />
        </View>

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Chefs cerca de ti</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetList}>
            {nearby.map((item) => (
              <Pressable
                key={item.name}
                style={styles.item}
                onPress={() => {
                  selectChef(item.chefId);
                  navigation.navigate('Profile');
                }}
              >
                <View style={styles.avatar} />
                <View style={styles.itemBody}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{item.city}  -  ETA {item.eta}</Text>
                </View>
                <Text style={styles.itemAction}>Ver</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <BottomNav activeTab="Search" onNavigate={(route) => navigation.navigate(route)} />
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
  searchBar: {
    marginTop: 10,
    marginHorizontal: 20,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  searchText: {
    color: colors.textSoft,
    fontSize: 15
  },
  filterText: {
    color: colors.primary,
    fontWeight: '800'
  },
  mapMock: {
    marginTop: 14,
    marginHorizontal: 20,
    height: 330,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundMuted,
    overflow: 'hidden'
  },
  routeA: {
    position: 'absolute',
    top: 28,
    left: 24,
    right: 24,
    bottom: 28,
    borderWidth: 2,
    borderColor: '#FDD4CD',
    borderRadius: 999
  },
  routeB: {
    position: 'absolute',
    top: 90,
    left: 80,
    right: 80,
    bottom: 90,
    borderWidth: 2,
    borderColor: '#FFD9D3',
    borderRadius: 999
  },
  pin: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: '#FFFFFF'
  },
  pinOne: {
    top: 68,
    left: 90
  },
  pinTwo: {
    top: 120,
    right: 82
  },
  pinThree: {
    bottom: 120,
    left: 122
  },
  pinFour: {
    bottom: 62,
    right: 104
  },
  sheet: {
    flex: 1,
    marginTop: 14,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
    backgroundColor: colors.background
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 50,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.borderStrong
  },
  sheetTitle: {
    marginTop: 12,
    fontSize: 21,
    fontWeight: '900',
    color: colors.textStrong
  },
  sheetList: {
    marginTop: 10,
    gap: 10
  },
  item: {
    minHeight: 78,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 46,
    backgroundColor: '#FFE5E2'
  },
  itemBody: {
    flex: 1,
    gap: 3
  },
  itemName: {
    color: colors.textStrong,
    fontWeight: '800',
    fontSize: 16
  },
  itemMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  itemAction: {
    color: colors.primary,
    fontWeight: '800'
  }
});
