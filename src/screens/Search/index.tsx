import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { grillerzApi } from '../../api/grillerzApi';
import { RootStackParamList } from '../../navigation/screenConfig';
import { BottomNav } from '../../components/ui/BottomNav';
import { ReliableImage } from '../../components/ui/ReliableImage';
import { OFFLINE_DEMO_MODE } from '../../config/api';
import { getFallbackChefMenuItems } from '../../data/chefMenuItems';
import { getFallbackEvents } from '../../data/grillerEvents';
import { getDishImageByName } from '../../data/mediaLibrary';
import { getLocalAvatarUriByChef, getLocalDishUriByName } from '../../data/localMedia';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { GrillerEvent } from '../../types/domain';
import { getChefAvatarUrl } from '../../utils/chefMedia';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

type SearchType = 'all' | 'griller' | 'dish' | 'event' | 'city';

type SearchItem = {
  id: string;
  type: Exclude<SearchType, 'all'>;
  chefId: string;
  title: string;
  subtitle: string;
  city: string;
  imageUrl: string;
  fallbackUrl: string;
  keywords: string[];
  rank: number;
  eventId?: string;
};

const initialRecent = ['Costillas en Nuevo Laredo', 'Asador para 25 personas', 'Tomahawk premium'];

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function Search({ navigation }: Props) {
  const { chefs, selectChef } = useAppState();
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<SearchType>('all');
  const [recent, setRecent] = useState(initialRecent);
  const [events, setEvents] = useState<GrillerEvent[]>(getFallbackEvents('Publicado'));

  useEffect(() => {
    let active = true;

    if (OFFLINE_DEMO_MODE) {
      return () => {
        active = false;
      };
    }

    async function loadEvents() {
      try {
        const remoteEvents = await grillerzApi.getEvents({ status: 'Publicado' });
        if (active) {
          setEvents(remoteEvents);
        }
      } catch {
        // fallback local events already loaded
      }
    }

    void loadEvents();

    return () => {
      active = false;
    };
  }, []);

  const allItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];

    chefs.forEach((chef) => {
      const avatarUrl = getChefAvatarUrl(chef);
      const avatarFallbackUrl = getLocalAvatarUriByChef(chef.id);

      items.push({
        id: `griller-${chef.id}`,
        type: 'griller',
        chefId: chef.id,
        title: chef.name,
        subtitle: `${chef.title} · ${chef.rating.toFixed(1)} 🔥 · Desde $${chef.basePrice.toLocaleString('es-MX')} MXN`,
        city: chef.city,
        imageUrl: avatarUrl,
        fallbackUrl: avatarFallbackUrl,
        keywords: [...chef.specialties, chef.title, 'griller', 'parrillero', 'asador'],
        rank: Math.round(chef.rating * 100)
      });

      chef.specialties.forEach((specialty, index) => {
        items.push({
          id: `dish-${chef.id}-${index}`,
          type: 'dish',
          chefId: chef.id,
          title: specialty,
          subtitle: `${chef.name} · ${chef.city}`,
          city: chef.city,
          imageUrl: getDishImageByName(specialty),
          fallbackUrl: getLocalDishUriByName(specialty),
          keywords: [chef.name, chef.title, ...chef.specialties, 'platillo', 'corte'],
          rank: 170 - index * 4
        });
      });

      getFallbackChefMenuItems(chef.id).forEach((menuItem, index) => {
        items.push({
          id: `menu-${menuItem.id}`,
          type: 'dish',
          chefId: chef.id,
          title: menuItem.name,
          subtitle: `${chef.name} · ${menuItem.category} · $${menuItem.price.toLocaleString('es-MX')} MXN`,
          city: chef.city,
          imageUrl: getDishImageByName(menuItem.name),
          fallbackUrl: getLocalDishUriByName(menuItem.name),
          keywords: [menuItem.details, menuItem.category, chef.name, chef.title, ...chef.specialties, 'menu', 'platillo', 'corte'],
          rank: 160 - index * 3
        });
      });

      items.push({
        id: `city-${chef.id}`,
        type: 'city',
        chefId: chef.id,
        title: chef.city,
        subtitle: `${chef.name} · Desde $${chef.basePrice.toLocaleString('es-MX')} MXN`,
        city: chef.city,
        imageUrl: avatarUrl,
        fallbackUrl: avatarFallbackUrl,
        keywords: [chef.name, ...chef.specialties, chef.title, 'ciudad', 'zona', 'cerca'],
        rank: 80
      });
    });

    events.forEach((event) => {
      const mediaSeed = event.menu[0] ?? event.title;
      items.push({
        id: `event-${event.id}`,
        type: 'event',
        chefId: event.chefId,
        title: event.title,
        subtitle: `${event.chefName} · ${event.dateKey} · ${event.timeLabel}`,
        city: event.city,
        imageUrl: getDishImageByName(mediaSeed),
        fallbackUrl: getLocalDishUriByName(mediaSeed),
        keywords: [event.description, event.venueName, event.address, ...event.menu, event.chefName, 'evento', 'reservacion', 'apartar'],
        rank: 220 - event.seatsAvailable,
        eventId: event.id
      });
    });

    return items;
  }, [chefs, events]);

  const visibleResults = useMemo(() => {
    const normalized = normalizeText(query);
    const queryTokens = normalized.split(' ').filter(Boolean);

    const typedItems =
      activeType === 'all'
        ? allItems
        : allItems.filter((item) => {
            if (activeType === 'griller') {
              return item.type === 'griller';
            }
            if (activeType === 'dish') {
              return item.type === 'dish';
            }
            if (activeType === 'event') {
            return item.type === 'event';
          }
          return item.type === 'city';
        });

    if (queryTokens.length === 0) {
      return [...typedItems]
        .sort((a, b) => b.rank - a.rank)
        .slice(0, 16);
    }

    return typedItems
      .filter((item) => {
        const title = normalizeText(item.title);
        const subtitle = normalizeText(item.subtitle);
        const city = normalizeText(item.city);
        const keywords = normalizeText(item.keywords.join(' '));

        return queryTokens.every((token) => {
          return title.includes(token) || subtitle.includes(token) || city.includes(token) || keywords.includes(token);
        });
      })
      .map((item) => {
        const title = normalizeText(item.title);
        const subtitle = normalizeText(item.subtitle);
        const city = normalizeText(item.city);
        const keywords = normalizeText(item.keywords.join(' '));

        let score = item.rank;
        if (title.startsWith(normalized)) {
          score += 120;
        }
        if (title.includes(normalized)) {
          score += 90;
        }
        if (subtitle.includes(normalized)) {
          score += 45;
        }
        if (city.includes(normalized)) {
          score += 30;
        }
        if (keywords.includes(normalized)) {
          score += 20;
        }

        queryTokens.forEach((token) => {
          if (title.includes(token)) {
            score += 18;
          }
          if (subtitle.includes(token)) {
            score += 10;
          }
          if (city.includes(token)) {
            score += 8;
          }
          if (keywords.includes(token)) {
            score += 7;
          }
        });

        return (
          {
            ...item,
            _score: score
          } as SearchItem & { _score: number }
        );
      })
      .sort((a, b) => {
        if (a._score !== b._score) {
          return b._score - a._score;
        }
        return a.title.localeCompare(b.title);
      })
      .slice(0, 40);
  }, [activeType, allItems, query]);

  function submitRecent(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    setQuery(trimmed);
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())];
      return next.slice(0, 8);
    });
  }

  function openResult(item: SearchItem) {
    selectChef(item.chefId);
    if (item.type === 'event' && item.eventId) {
      navigation.navigate('EventDetails', { eventId: item.eventId, chefId: item.chefId });
      return;
    }
    navigation.navigate('Profile');
  }

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
              placeholder="Griller, platillo, ciudad, evento..."
              placeholderTextColor={colors.textSoft}
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={() => submitRecent(query)}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typesRow}>
            {[
              { key: 'all', label: 'Todo' },
              { key: 'griller', label: 'Grillers' },
              { key: 'dish', label: 'Platillos' },
              { key: 'event', label: 'Eventos' },
              { key: 'city', label: 'Ciudades' }
            ].map((item) => {
              const active = activeType === item.key;
              return (
                <Pressable key={item.key} style={[styles.typeChip, active ? styles.typeChipActive : null]} onPress={() => setActiveType(item.key as SearchType)}>
                  <Text style={[styles.typeChipLabel, active ? styles.typeChipLabelActive : null]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recientes</Text>
            <Pressable onPress={() => setRecent([])}>
              <Text style={styles.link}>Limpiar</Text>
            </Pressable>
          </View>

          <View style={styles.chipsRow}>
            {recent.map((item) => (
              <Pressable key={item} style={styles.chip} onPress={() => submitRecent(item)}>
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
              const iconName = item.type === 'event' ? 'calendar-star' : item.type === 'dish' ? 'silverware-fork-knife' : item.type === 'city' ? 'map-marker' : 'fire';

              return (
                <Pressable key={item.id} style={styles.item} onPress={() => openResult(item)}>
                  <View style={styles.thumb}>
                    <ReliableImage uri={item.imageUrl} fallbackUri={item.fallbackUrl} style={styles.thumbImage} />
                  </View>
                  <View style={styles.itemBody}>
                    <Text style={styles.itemName}>{item.title}</Text>
                    <Text style={styles.itemSpec}>{item.subtitle}</Text>
                    <Text style={styles.itemCity}>{item.city}</Text>
                  </View>
                  <View style={styles.itemMeta}>
                    <MaterialCommunityIcons name={iconName} size={16} color={colors.primary} />
                    <Text style={styles.itemType}>
                      {item.type === 'griller' ? 'Griller' : item.type === 'dish' ? 'Platillo' : item.type === 'event' ? 'Evento' : 'Ciudad'}
                    </Text>
                  </View>
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
  typesRow: {
    marginTop: 12,
    gap: 8,
    paddingRight: 12
  },
  typeChip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  typeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  typeChipLabel: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 12
  },
  typeChipLabelActive: {
    color: colors.primaryDark
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
  itemMeta: {
    alignItems: 'center',
    gap: 2
  },
  itemType: {
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: '700'
  },
  emptyText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10
  }
});
