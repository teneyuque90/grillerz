import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { BottomNav } from '../../components/ui/BottomNav';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { getChefCoverUrl } from '../../utils/chefMedia';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

const recent = ['Costillas en Nuevo Laredo', 'Asador para 25 personas', 'Tomahawk premium'];
const results = [
  { name: 'Martin Asador', chefId: 'martin-asador', speciality: 'Costillas a la Parrilla', city: 'Nuevo Laredo' },
  { name: 'Erick Martinez', chefId: 'erick-martinez', speciality: 'Tomahawk al Carbon', city: 'Monterrey' },
  { name: 'Carlos BBQ', chefId: 'carlos-bbq', speciality: 'Parrilla Mixta', city: 'Saltillo' }
];

export function Search({ navigation }: Props) {
  const { chefs, selectChef } = useAppState();
  const [query, setQuery] = useState('');

  const visibleResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return results;
    }

    return results.filter((item) => {
      return (
        item.name.toLowerCase().includes(normalized) ||
        item.speciality.toLowerCase().includes(normalized) ||
        item.city.toLowerCase().includes(normalized)
      );
    });
  }, [query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>buscar</Text>
            <Pressable onPress={() => navigation.navigate('Filter')}>
              <Text style={styles.action}>Filtro</Text>
            </Pressable>
          </View>

          <View style={styles.searchBar}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Griller, platillo, ciudad..."
              placeholderTextColor={colors.textSoft}
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recientes</Text>
            <Pressable>
              <Text style={styles.link}>Limpiar</Text>
            </Pressable>
          </View>

          <View style={styles.chipsRow}>
            {recent.map((item) => (
              <Pressable key={item} style={styles.chip} onPress={() => setQuery(item)}>
                <Text style={styles.chipText}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Resultados sugeridos</Text>
            <Pressable onPress={() => navigation.navigate('Map')}>
              <Text style={styles.link}>Ver mapa</Text>
            </Pressable>
          </View>

          <View style={styles.list}>
            {visibleResults.map((item) => {
              const chef = chefs.find((candidate) => candidate.id === item.chefId);
              const imageUrl = getChefCoverUrl(chef);

              return (
                <Pressable
                  key={item.name}
                  style={styles.item}
                  onPress={() => {
                    selectChef(item.chefId);
                    navigation.navigate('Profile');
                  }}
                >
                  <View style={styles.thumb}>
                    <Image source={{ uri: imageUrl }} style={styles.thumbImage} />
                  </View>
                  <View style={styles.itemBody}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemSpec}>{item.speciality}</Text>
                    <Text style={styles.itemCity}>{item.city}</Text>
                  </View>
                  <Text style={styles.itemCta}>Ver</Text>
                </Pressable>
              );
            })}
            {visibleResults.length === 0 ? <Text style={styles.emptyText}>No hay resultados para esa busqueda.</Text> : null}
          </View>
        </ScrollView>

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120
  },
  headerRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    color: colors.textStrong,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900'
  },
  action: {
    color: colors.primary,
    fontWeight: '800'
  },
  searchBar: {
    marginTop: 10,
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center'
  },
  searchInput: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 0
  },
  sectionHeader: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    color: colors.textStrong,
    fontSize: 20,
    fontWeight: '900'
  },
  link: {
    color: colors.primary,
    fontWeight: '800'
  },
  chipsRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: colors.backgroundMuted
  },
  chipText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13
  },
  list: {
    marginTop: 12,
    gap: 10
  },
  item: {
    minHeight: 90,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  thumb: {
    width: 62,
    height: 62,
    borderRadius: 10,
    overflow: 'hidden'
  },
  thumbImage: {
    width: '100%',
    height: '100%'
  },
  itemBody: {
    flex: 1,
    gap: 2
  },
  itemName: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '800'
  },
  itemSpec: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600'
  },
  itemCity: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  itemCta: {
    color: colors.primary,
    fontWeight: '800'
  },
  emptyText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10
  }
});
