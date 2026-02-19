import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomNav } from '../../components/ui/BottomNav';
import { ReliableImage } from '../../components/ui/ReliableImage';
import { ReliableImageBackground } from '../../components/ui/ReliableImageBackground';
import { AppChip } from '../../components/ui/AppChip';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { Chef } from '../../types/domain';
import { getLocalAvatarUriByChef, getLocalCoverUriByChef } from '../../data/localMedia';
import { getChefAvatarUrl, getChefCoverUrl } from '../../utils/chefMedia';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;
type FavoritesFilter = 'all' | 'topRated' | 'nearMe';

function getFilterLabel(filter: FavoritesFilter) {
  if (filter === 'topRated') {
    return 'Top rated';
  }

  if (filter === 'nearMe') {
    return 'Cerca de mi';
  }

  return 'Todos';
}

export function Favorites({ navigation }: Props) {
  const [activeFilter, setActiveFilter] = useState<FavoritesFilter>('all');
  const { authUser, chefs, favoriteChefIds, selectChef, toggleFavoriteChef } = useAppState();
  const userCity = authUser?.city?.trim().toLowerCase() ?? '';

  const favoriteChefs = useMemo(() => {
    const byId = new Map(chefs.map((item) => [item.id, item]));
    return favoriteChefIds.map((id) => byId.get(id)).filter(Boolean) as Chef[];
  }, [chefs, favoriteChefIds]);

  const filteredChefs = useMemo(() => {
    const base = [...favoriteChefs].sort((a, b) => b.rating - a.rating);

    if (activeFilter === 'topRated') {
      return base.filter((item) => item.rating >= 4.8);
    }

    if (activeFilter === 'nearMe') {
      return base.filter((item) => item.city.trim().toLowerCase() === userCity);
    }

    return base;
  }, [activeFilter, favoriteChefs, userCity]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader
            title="Favoritos"
            onBack={() => navigation.goBack()}
            rightAction="Buscar"
            onRightAction={() => navigation.navigate('Search')}
          />

          <View style={styles.chipsRow}>
            <AppChip label="Todos" selected={activeFilter === 'all'} onPress={() => setActiveFilter('all')} />
            <AppChip label="Top rated" selected={activeFilter === 'topRated'} onPress={() => setActiveFilter('topRated')} />
            <AppChip label="Cerca de mi" selected={activeFilter === 'nearMe'} onPress={() => setActiveFilter('nearMe')} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {filteredChefs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No hay grillers en este filtro</Text>
                <Text style={styles.emptySubtitle}>Filtro activo: {getFilterLabel(activeFilter)}. Prueba otro filtro o agrega favoritos desde su perfil.</Text>
                <Pressable style={styles.emptyAction} onPress={() => navigation.navigate('Browse01')}>
                  <Text style={styles.emptyActionLabel}>Ver grillers</Text>
                </Pressable>
              </View>
            ) : null}

            {filteredChefs.map((chef) => {
              const avatarUrl = getChefAvatarUrl(chef);
              const coverUrl = getChefCoverUrl(chef);
              const avatarFallbackUrl = getLocalAvatarUriByChef(chef.id);
              const coverFallbackUrl = getLocalCoverUriByChef(chef.id);

              return (
                <View key={chef.id} style={styles.card}>
                  <ReliableImageBackground
                    uri={coverUrl}
                    fallbackUri={coverFallbackUrl}
                    style={styles.cover}
                    imageStyle={styles.coverImage}
                  >
                    <View style={styles.coverShade} />
                  </ReliableImageBackground>

                  <View style={styles.profileRow}>
                    <ReliableImage uri={avatarUrl} fallbackUri={avatarFallbackUrl} style={styles.avatar} />
                    <View style={styles.headline}>
                      <Text style={styles.name}>{chef.name}</Text>
                      <Text style={styles.subline}>{chef.title}</Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.meta}>{chef.city}</Text>
                        <View style={styles.ratingChip}>
                          <MaterialCommunityIcons name="fire" size={14} color={colors.primary} />
                          <Text style={styles.ratingText}>{chef.rating.toFixed(1)}</Text>
                        </View>
                      </View>
                    </View>
                    <Pressable
                      style={styles.favoriteButton}
                      onPress={() => toggleFavoriteChef(chef.id)}
                      hitSlop={8}
                    >
                      <MaterialCommunityIcons name="heart" size={18} color={colors.primary} />
                    </Pressable>
                  </View>

                  <View style={styles.specialtyWrap}>
                    {chef.specialties.slice(0, 3).map((item) => (
                      <View key={`${chef.id}-${item}`} style={styles.specialtyChip}>
                        <Text style={styles.specialtyLabel}>{item}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.bottomRow}>
                    <Text style={styles.price}>Desde ${chef.basePrice.toLocaleString('es-MX')} MXN</Text>
                    <View style={styles.actionsRow}>
                      <Pressable
                        style={styles.secondaryBtn}
                        onPress={() => {
                          selectChef(chef.id);
                          navigation.navigate('Profile');
                        }}
                      >
                        <Text style={styles.secondaryLabel}>Ver perfil</Text>
                      </Pressable>
                      <Pressable
                        style={styles.primaryBtn}
                        onPress={() => {
                          selectChef(chef.id);
                          navigation.navigate('Schedule');
                        }}
                      >
                        <Text style={styles.primaryLabel}>Reservar</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <BottomNav activeTab="Favorites" onNavigate={(route) => navigation.navigate(route)} />
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
    paddingTop: 10,
    paddingBottom: 120
  },
  chipsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8
  },
  list: {
    marginTop: 16,
    gap: 16,
    paddingBottom: 20
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
    backgroundColor: '#FFFFFF'
  },
  emptyTitle: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '900'
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18
  },
  emptyAction: {
    alignSelf: 'flex-start',
    minHeight: 36,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    justifyContent: 'center'
  },
  emptyActionLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 12,
    backgroundColor: '#FFFFFF'
  },
  cover: {
    height: 116,
    borderRadius: 12,
    overflow: 'hidden'
  },
  coverImage: {
    borderRadius: 12
  },
  coverShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 8, 0.2)'
  },
  profileRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: -24,
    alignItems: 'flex-end'
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 68,
    backgroundColor: '#FFE5E2',
    borderWidth: 3,
    borderColor: '#FFFFFF'
  },
  headline: {
    flex: 1,
    gap: 2
  },
  name: {
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: '900'
  },
  subline: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700'
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FFD4CC',
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  ratingText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '800'
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#FFD4CC',
    backgroundColor: '#FFF1EE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  specialtyWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  specialtyChip: {
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  specialtyLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  price: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '900'
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8
  },
  secondaryBtn: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  secondaryLabel: {
    color: colors.textStrong,
    fontWeight: '700',
    fontSize: 12
  },
  primaryBtn: {
    minHeight: 36,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12
  }
});
