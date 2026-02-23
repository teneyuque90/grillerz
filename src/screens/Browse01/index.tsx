import { useEffect, useMemo, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { grillerzApi } from '../../api/grillerzApi';
import { RootStackParamList } from '../../navigation/screenConfig';
import { BottomNav } from '../../components/ui/BottomNav';
import { ReliableImage } from '../../components/ui/ReliableImage';
import { ReliableImageBackground } from '../../components/ui/ReliableImageBackground';
import { OFFLINE_DEMO_MODE } from '../../config/api';
import { getFallbackEvents } from '../../data/grillerEvents';
import { getDishImageByName } from '../../data/mediaLibrary';
import { getLocalAvatarUriByChef, getLocalCoverUriByChef, getLocalDishUriByName } from '../../data/localMedia';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { AppSpacing } from '../../theme/grillerzTheme';
import { AppButton } from '../../ui/components/AppButton';
import { AppCard } from '../../ui/components/AppCard';
import { AppChip } from '../../ui/components/AppChip';
import { AppScreen } from '../../ui/components/AppScreen';
import { AppText } from '../../ui/components/AppText';
import { SectionHeader } from '../../ui/components/SectionHeader';
import { GrillerEvent } from '../../types/domain';
import { getChefAvatarUrl, getChefCoverUrl } from '../../utils/chefMedia';

type Props = NativeStackScreenProps<RootStackParamList, 'Browse01'>;

const featured = [
  { dishName: 'Costillas a la Parrilla', chefId: 'cories-bbq', price: '$2,800' },
  { dishName: 'Asado Regio', chefId: 'luis-bbq', price: '$3,200' },
  { dishName: 'Costillas Ahumadas', chefId: 'martin-asador', price: '$3,600' }
];
const categories = [
  { key: 'Top', icon: 'fire', tint: '#E53935' },
  { key: 'Costillas', icon: 'food-steak', tint: '#EF4444' },
  { key: 'Tomahawk', icon: 'knife', tint: '#F97316' },
  { key: 'Parrilla', icon: 'grill-outline', tint: '#DC2626' },
  { key: 'Ahumados', icon: 'smoke', tint: '#B91C1C' },
  { key: 'Brisket', icon: 'food', tint: '#E11D48' },
  { key: 'Cabrito', icon: 'chef-hat', tint: '#EA580C' },
  { key: 'Mariscos', icon: 'fish', tint: '#0EA5E9' },
  { key: 'Rib Eyes', icon: 'silverware-fork-knife', tint: '#D97706' },
  { key: 'Arrachera', icon: 'cow', tint: '#F43F5E' },
  { key: 'Picana', icon: 'food-variant', tint: '#FB7185' },
  { key: 'T-Bone', icon: 'food-drumstick', tint: '#C2410C' }
] as const;
type AvailabilityFilter = 'all' | 'today' | 'tomorrow';
type AvailabilityStatus = {
  label: 'Hoy' | 'Mañana' | 'Próximo';
  kind: 'today' | 'tomorrow' | 'next';
  color: string;
};
const DEFAULT_AVAILABILITY: AvailabilityStatus = { label: 'Próximo', kind: 'next', color: colors.textSoft };

export function Browse01({ navigation }: Props) {
  const { chefs, selectChef, authUser } = useAppState();
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]['key']>(categories[0].key);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [showGrillersModal, setShowGrillersModal] = useState(false);
  const [grillerEvents, setGrillerEvents] = useState<GrillerEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventNotice, setEventNotice] = useState<string | null>(null);
  const heroItem = featured[0];
  const heroChef = chefs.find((chef) => chef.id === heroItem.chefId);
  const heroCoverUrl = getChefCoverUrl(heroChef);
  const heroFallbackUrl = getLocalCoverUriByChef(heroChef?.id ?? heroItem.chefId);
  const nearestCity = authUser?.city ?? 'Nuevo Laredo';
  const todayWeekday = new Date().getDay();
  const tomorrowWeekday = (todayWeekday + 1) % 7;

  const availableGrillers = useMemo(() => {
    return [...chefs].sort((a, b) => {
      const cityScoreA = a.city.toLowerCase() === nearestCity.toLowerCase() ? 1 : 0;
      const cityScoreB = b.city.toLowerCase() === nearestCity.toLowerCase() ? 1 : 0;

      if (cityScoreA !== cityScoreB) {
        return cityScoreB - cityScoreA;
      }

      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }

      return a.basePrice - b.basePrice;
    });
  }, [chefs, nearestCity]);
  const spotlightGrillers = useMemo(() => {
    if (availableGrillers.length === 0) {
      return [];
    }
    const start = new Date().getDate() % availableGrillers.length;
    return [...availableGrillers.slice(start), ...availableGrillers.slice(0, start)];
  }, [availableGrillers]);
  const availabilityByChefId = useMemo<Record<string, AvailabilityStatus>>(() => {
    const map: Record<string, AvailabilityStatus> = {};
    let hasTomorrow = false;

    availableGrillers.forEach((chef, index) => {
      const weekdays = chef.availability?.weekdays ?? [];
      const hasToday = weekdays.includes(todayWeekday);
      const hasTomorrowCandidate = weekdays.includes(tomorrowWeekday);

      if (hasToday && hasTomorrowCandidate) {
        const useTomorrowShowcase = index % 3 === 1;
        map[chef.id] = useTomorrowShowcase
          ? { label: 'Mañana', kind: 'tomorrow', color: '#D97706' }
          : { label: 'Hoy', kind: 'today', color: colors.success };
      } else if (hasToday) {
        map[chef.id] = { label: 'Hoy', kind: 'today', color: colors.success };
      } else if (hasTomorrowCandidate) {
        map[chef.id] = { label: 'Mañana', kind: 'tomorrow', color: '#D97706' };
      } else {
        map[chef.id] = DEFAULT_AVAILABILITY;
      }

      if (map[chef.id].kind === 'tomorrow') {
        hasTomorrow = true;
      }
    });

    // Siempre deja al menos un ejemplo de "Mañana" para demo visual.
    if (!hasTomorrow) {
      const fallbackChef = availableGrillers.find((chef) => map[chef.id]?.kind === 'today');
      if (fallbackChef) {
        map[fallbackChef.id] = { label: 'Mañana', kind: 'tomorrow', color: '#D97706' };
      }
    }

    return map;
  }, [availableGrillers, todayWeekday, tomorrowWeekday]);
  const filteredAvailableGrillers = useMemo(() => {
    if (availabilityFilter === 'all') {
      return availableGrillers;
    }

    return availableGrillers.filter((chef) => availabilityByChefId[chef.id]?.kind === availabilityFilter);
  }, [availabilityByChefId, availabilityFilter, availableGrillers]);
  const visibleFeatured = useMemo(() => {
    if (activeCategory === 'Top') {
      return featured;
    }

    const normalizedCategory = activeCategory.toLowerCase();
    const filtered = featured.filter((item) => item.dishName.toLowerCase().includes(normalizedCategory));
    return filtered.length > 0 ? filtered : featured;
  }, [activeCategory]);

  function openEventInMaps(address: string, city: string) {
    const query = encodeURIComponent(`${address}, ${city}`);
    void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  }

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      setIsLoadingEvents(true);
      setEventNotice(null);

      if (OFFLINE_DEMO_MODE) {
        const localEvents = getFallbackEvents('Publicado');
        if (active) {
          setGrillerEvents(localEvents);
          setIsLoadingEvents(false);
        }
        return;
      }

      try {
        const remoteEvents = await grillerzApi.getEvents({ status: 'Publicado' });
        if (active) {
          setGrillerEvents(remoteEvents);
        }
      } catch {
        const localEvents = getFallbackEvents('Publicado');
        if (active) {
          setGrillerEvents(localEvents);
          setEventNotice('Mostrando eventos demo por conexion.');
        }
      } finally {
        if (active) {
          setIsLoadingEvents(false);
        }
      }
    }

    void loadEvents();

    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.screen}>
      <AppScreen scroll contentStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <AppText variant="title" style={styles.title}>Populares en tu zona</AppText>
          <Pressable onPress={() => navigation.navigate('Search')}>
            <AppText variant="body" style={styles.search}>Buscar</AppText>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {categories.map((item) => {
            const selected = item.key === activeCategory;
            return (
              <Pressable
                key={item.key}
                style={styles.categoryPill}
                onPress={() => setActiveCategory(item.key)}
              >
                <View style={[styles.categoryPreviewWrap, selected ? styles.categoryPreviewWrapActive : null]}>
                  <LinearGradient
                    colors={selected ? ['#FFE9E6', '#FFF8F7'] : ['#FAFAFA', '#F2F4F7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.categoryPreviewImage}
                  >
                    <View style={[styles.categoryIconBubble, { backgroundColor: `${item.tint}1F` }]}>
                      <MaterialCommunityIcons name={item.icon} size={22} color={item.tint} />
                    </View>
                    <View style={styles.categoryPreviewFooter}>
                      <AppText variant="caption" style={[styles.categoryPreviewLabel, selected ? styles.categoryPreviewLabelActive : null]}>
                        {item.key}
                      </AppText>
                    </View>
                  </LinearGradient>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <AppCard
          style={styles.heroCard}
          contentStyle={styles.heroContent}
          onPress={() => {
            selectChef(heroItem.chefId);
            navigation.navigate('Profile');
          }}
        >
          {heroCoverUrl ? (
            <ReliableImageBackground
              uri={heroCoverUrl}
              fallbackUri={heroFallbackUrl}
              style={styles.heroMedia}
              imageStyle={styles.heroMediaImage}
            >
              <View style={styles.heroShade} />
            </ReliableImageBackground>
          ) : (
            <LinearGradient colors={[colors.flameEnd, colors.flameStart]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroMedia} />
          )}

          <View style={styles.heroBadgeRow}>
            <AppChip label={heroChef?.city ?? 'Nuevo Laredo'} selected />
          </View>
          <View>
            <AppText variant="title" style={styles.heroLabel}>{heroItem.dishName}</AppText>
            <AppText variant="caption" style={styles.heroSub}>{heroChef?.name ?? 'Griller'}  -  {heroChef?.city ?? 'Nuevo Laredo'}</AppText>
          </View>
        </AppCard>

        <SectionHeader
          title="Recomendados"
          actionText="Ver todo"
          onActionPress={() => navigation.navigate('Categories')}
        />

        <View style={styles.list}>
          {visibleFeatured.map((item) => {
            const chef = chefs.find((candidate) => candidate.id === item.chefId);
            const coverUrl = chef ? getChefCoverUrl(chef) : getDishImageByName(item.dishName);
            const coverFallbackUrl = chef ? getLocalCoverUriByChef(chef.id) : getLocalDishUriByName(item.dishName);

            return (
              <AppCard
                key={`${item.chefId}-${item.dishName}`}
                style={styles.item}
                contentStyle={styles.itemContent}
                onPress={() => {
                  selectChef(item.chefId);
                  navigation.navigate('Profile');
                }}
              >
                <View style={styles.itemThumb}>
                  {coverUrl ? (
                    <ReliableImage uri={coverUrl} fallbackUri={coverFallbackUrl} style={styles.itemThumbImage} />
                  ) : (
                    <LinearGradient colors={['#FFD8CF', '#FFF1EE']} style={StyleSheet.absoluteFill} />
                  )}
                </View>
                <View style={styles.itemBody}>
                  <AppText variant="section" style={styles.itemName}>{item.dishName}</AppText>
                  <AppText variant="caption" style={styles.itemChef}>{chef?.name ?? 'Griller'}</AppText>
                </View>
                <AppText variant="body" style={styles.itemPrice}>{item.price}</AppText>
              </AppCard>
            );
          })}
        </View>

        <SectionHeader title="Grillers disponibles" actionText="Ver todos" onActionPress={() => setShowGrillersModal(true)} />
        <View style={styles.availabilityFilterRow}>
          <AppChip label="Todos" selected={availabilityFilter === 'all'} onPress={() => setAvailabilityFilter('all')} />
          <AppChip label="Hoy" selected={availabilityFilter === 'today'} onPress={() => setAvailabilityFilter('today')} />
          <AppChip label="Mañana" selected={availabilityFilter === 'tomorrow'} onPress={() => setAvailabilityFilter('tomorrow')} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickGrillersRow}>
          {(availabilityFilter === 'all' ? spotlightGrillers : filteredAvailableGrillers).map((griller) => {
            const avatarUrl = getChefAvatarUrl(griller);
            const avatarFallbackUrl = getLocalAvatarUriByChef(griller.id);
            const availability = availabilityByChefId[griller.id] ?? DEFAULT_AVAILABILITY;
            return (
              <Pressable
                key={`quick-${griller.id}`}
                style={styles.quickGrillerCard}
                onPress={() => {
                  selectChef(griller.id);
                  navigation.navigate('Profile');
                }}
              >
                <ReliableImage uri={avatarUrl} fallbackUri={avatarFallbackUrl} style={styles.quickGrillerAvatar} />
                <AppText variant="caption" style={styles.quickGrillerName}>{griller.name}</AppText>
                <AppText variant="caption" style={[styles.quickGrillerAvailability, { color: availability.color }]}>
                  {availability.label}
                </AppText>
              </Pressable>
            );
          })}
          {availabilityFilter !== 'all' && filteredAvailableGrillers.length === 0 ? (
            <AppCard style={styles.emptyAvailabilityCard}>
              <AppText variant="caption">No hay grillers con ese filtro.</AppText>
            </AppCard>
          ) : null}
        </ScrollView>

        <SectionHeader title="Eventos Grillerz" actionText="Ver mapa" onActionPress={() => navigation.navigate('Map')} />
        {eventNotice ? <AppText variant="caption" style={styles.eventNotice}>{eventNotice}</AppText> : null}
        {isLoadingEvents ? (
          <AppCard style={styles.eventSkeleton}>
            <AppText variant="body">Cargando eventos...</AppText>
          </AppCard>
        ) : null}
        {!isLoadingEvents && grillerEvents.length === 0 ? (
          <AppCard style={styles.eventSkeleton}>
            <AppText variant="body">Aun no hay eventos publicados.</AppText>
          </AppCard>
        ) : null}
        {!isLoadingEvents ? (
          <View style={styles.eventsList}>
            {grillerEvents.map((event) => {
              const chef = chefs.find((item) => item.id === event.chefId);
              const eventImage = getDishImageByName(event.menu[0] ?? event.title);
              const eventImageFallback = getLocalDishUriByName(event.menu[0] ?? event.title);

              return (
                <AppCard key={event.id} style={styles.eventCard}>
                  <ReliableImageBackground uri={eventImage} fallbackUri={eventImageFallback} style={styles.eventMedia} imageStyle={styles.eventMediaImage}>
                    <View style={styles.eventMediaShade} />
                    <View style={styles.eventMediaTopRow}>
                      <AppChip label={event.dateKey} selected />
                      <AppChip label={`${event.seatsAvailable}/${event.capacityTotal} cupos`} selected />
                    </View>
                    <View>
                      <AppText variant="section" style={styles.eventMediaTitle}>{event.title}</AppText>
                      <View style={styles.eventChefRow}>
                        <AppText variant="caption" style={styles.eventChefName}>{event.chefName}</AppText>
                        <AppText variant="caption" style={styles.eventChefCity}> · {event.city}</AppText>
                      </View>
                    </View>
                  </ReliableImageBackground>

                  <View style={styles.eventHeader}>
                    <View style={styles.eventHeaderCopy}>
                      <AppText variant="caption" style={styles.eventSub}>
                        {event.timeLabel} · {event.venueName}
                      </AppText>
                      <AppText variant="caption" style={styles.eventSub}>{event.address}</AppText>
                      <AppText variant="caption" style={styles.eventSub}>{event.description}</AppText>
                    </View>
                  </View>

                  <View style={styles.eventMenuWrap}>
                    {event.menu.slice(0, 4).map((item) => (
                      <AppChip key={`${event.id}-${item}`} label={item} />
                    ))}
                  </View>

                  <View style={styles.eventFooter}>
                    <View style={styles.eventPriceBlock}>
                      <AppText variant="caption">Por persona</AppText>
                      <AppText variant="section" style={styles.eventPrice}>
                        ${event.pricePerPerson.toLocaleString('es-MX')} MXN
                      </AppText>
                      <AppText variant="caption">Apartado mínimo: {event.minSeatsPerReservation} persona(s)</AppText>
                    </View>
                    <AppButton
                      label="Ver evento"
                      variant="primary"
                      style={styles.eventReserveButton}
                      labelStyle={styles.eventReserveButtonLabel}
                      onPress={() => {
                        if (chef) {
                          selectChef(chef.id);
                          navigation.navigate('EventDetails', { eventId: event.id, chefId: event.chefId });
                        }
                      }}
                    />
                  </View>
                  <View style={styles.eventMetaActions}>
                    <Pressable style={styles.eventMetaButton} onPress={() => openEventInMaps(event.address, event.city)}>
                      <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.primary} />
                      <AppText variant="caption" style={styles.eventMetaLabel}>Mapa</AppText>
                    </Pressable>
                    <View style={styles.eventMetaInfo}>
                      <MaterialCommunityIcons name="clock-time-four-outline" size={14} color={colors.textMuted} />
                      <AppText variant="caption" style={styles.eventMetaInfoLabel}>{event.timeLabel}</AppText>
                    </View>
                  </View>
                </AppCard>
              );
            })}
          </View>
        ) : null}

        <AppButton
          label="Contratar al Griller"
          variant="primary"
          onPress={() => {
            setShowGrillersModal(true);
          }}
        />
      </AppScreen>

      <Modal visible={showGrillersModal} transparent animationType="fade" onRequestClose={() => setShowGrillersModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <AppText variant="section">Grillers disponibles</AppText>
              <Pressable onPress={() => setShowGrillersModal(false)}>
                <AppText variant="body" style={styles.modalClose}>Cerrar</AppText>
              </Pressable>
            </View>
            <AppText variant="caption" style={styles.modalHint}>Mostrando primero los cercanos/populares en {nearestCity}.</AppText>
            <View style={styles.modalAvailabilityFilterRow}>
              <AppChip label="Todos" selected={availabilityFilter === 'all'} onPress={() => setAvailabilityFilter('all')} />
              <AppChip label="Hoy" selected={availabilityFilter === 'today'} onPress={() => setAvailabilityFilter('today')} />
              <AppChip label="Mañana" selected={availabilityFilter === 'tomorrow'} onPress={() => setAvailabilityFilter('tomorrow')} />
            </View>

            <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
              {(availabilityFilter === 'all' ? availableGrillers : filteredAvailableGrillers).map((griller) => {
                const avatarUrl = getChefAvatarUrl(griller);
                const avatarFallbackUrl = getLocalAvatarUriByChef(griller.id);
                const availability = availabilityByChefId[griller.id] ?? DEFAULT_AVAILABILITY;
                return (
                  <AppCard key={griller.id} style={styles.grillerCard}>
                    <View style={styles.grillerRow}>
                      <ReliableImage uri={avatarUrl} fallbackUri={avatarFallbackUrl} style={styles.grillerAvatar} />
                      <View style={styles.grillerBody}>
                        <AppText variant="section" style={styles.grillerName}>{griller.name}</AppText>
                        <AppText variant="caption">{griller.city} · {griller.rating.toFixed(1)} 🔥</AppText>
                        <AppText variant="caption" style={[styles.grillerAvailability, { color: availability.color }]}>{availability.label}</AppText>
                        <AppText variant="caption">Desde ${griller.basePrice.toLocaleString('es-MX')} MXN</AppText>
                      </View>
                      <Pressable
                        style={styles.grillerAction}
                        onPress={() => {
                          selectChef(griller.id);
                          setShowGrillersModal(false);
                          navigation.navigate('Profile');
                        }}
                      >
                        <AppText variant="caption" style={styles.grillerActionLabel}>Reservar</AppText>
                      </Pressable>
                    </View>
                  </AppCard>
                );
              })}
              {availabilityFilter !== 'all' && filteredAvailableGrillers.length === 0 ? (
                <AppCard style={styles.emptyAvailabilityCard}>
                  <AppText variant="caption">No hay grillers disponibles para ese filtro.</AppText>
                </AppCard>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BottomNav activeTab="Browse01" onNavigate={(route) => navigation.navigate(route)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 120
  },
  headerRow: {
    minHeight: 44,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: AppSpacing.s16
  },
  title: {
    maxWidth: 250,
    fontSize: 26,
    lineHeight: 30
  },
  search: {
    color: colors.primary,
    fontWeight: '800'
  },
  categoriesRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 12,
    paddingRight: 24
  },
  categoryPill: {
    width: 98
  },
  categoryPreviewWrap: {
    height: 106,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5
  },
  categoryPreviewWrapActive: {
    borderColor: colors.primary,
    shadowColor: colors.primarySoft,
    shadowOpacity: 0.35
  },
  categoryPreviewImage: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  categoryIconBubble: {
    width: 46,
    height: 46,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  categoryPreviewFooter: {
    minHeight: 32,
    paddingHorizontal: 6,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryPreviewLabel: {
    color: colors.textStrong,
    fontWeight: '800',
    textAlign: 'center'
  },
  categoryPreviewLabelActive: {
    color: colors.primaryDark
  },
  availabilityFilterRow: {
    marginTop: -4,
    marginBottom: 6,
    flexDirection: 'row',
    gap: 8
  },
  quickGrillersRow: {
    paddingVertical: 2,
    paddingRight: 24,
    gap: 12
  },
  quickGrillerCard: {
    width: 90,
    alignItems: 'center',
    gap: 3
  },
  emptyAvailabilityCard: {
    minWidth: 180
  },
  quickGrillerAvatar: {
    width: 58,
    height: 58,
    borderRadius: 58,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F7F7F7'
  },
  quickGrillerName: {
    textAlign: 'center',
    fontWeight: '800',
    color: colors.textStrong
  },
  quickGrillerAvailability: {
    textAlign: 'center',
    fontWeight: '700'
  },
  heroCard: {
    marginTop: 4,
    minHeight: 206,
    overflow: 'hidden'
  },
  heroContent: {
    minHeight: 206,
    justifyContent: 'space-between'
  },
  heroMedia: {
    ...StyleSheet.absoluteFillObject
  },
  heroMediaImage: {
    borderRadius: 16
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 8, 0.4)'
  },
  heroBadgeRow: {
    flexDirection: 'row'
  },
  heroLabel: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 34
  },
  heroSub: {
    marginTop: 6,
    color: '#FFD9D3',
    fontWeight: '700'
  },
  list: {
    gap: 12
  },
  eventsList: {
    gap: 12
  },
  eventNotice: {
    marginTop: -8,
    color: colors.textMuted
  },
  eventSkeleton: {
    minHeight: 62
  },
  eventCard: {
    gap: 10,
    overflow: 'hidden'
  },
  eventMedia: {
    minHeight: 168,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: 10
  },
  eventMediaImage: {
    borderRadius: 12
  },
  eventMediaShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 8, 0.4)'
  },
  eventMediaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  eventMediaTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 26
  },
  eventMediaSub: {
    marginTop: 4,
    color: '#FFD9D3',
    fontWeight: '700'
  },
  eventChefRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center'
  },
  eventChefName: {
    color: '#FFFFFF',
    fontWeight: '900'
  },
  eventChefCity: {
    color: '#FFD9D3',
    fontWeight: '700'
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  eventHeaderCopy: {
    flex: 1,
    gap: 2
  },
  eventSub: {
    color: colors.textMuted
  },
  eventMenuWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  eventPriceBlock: {
    flex: 1
  },
  eventPrice: {
    color: colors.primaryDark
  },
  eventReserveButton: {
    minHeight: 40,
    paddingHorizontal: 14
  },
  eventReserveButtonLabel: {
    fontSize: 14,
    lineHeight: 18
  },
  eventMetaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  eventMetaButton: {
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF'
  },
  eventMetaLabel: {
    color: colors.primaryDark,
    fontWeight: '700'
  },
  eventMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  eventMetaInfoLabel: {
    color: colors.textMuted
  },
  item: {
    minHeight: 96
  },
  itemContent: {
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
  itemThumbImage: {
    width: '100%',
    height: '100%'
  },
  itemBody: {
    flex: 1,
    gap: 2
  },
  itemName: {
    fontSize: 17
  },
  itemChef: {
    color: colors.textMuted
  },
  itemPrice: {
    color: colors.primaryDark,
    fontWeight: '900'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    paddingHorizontal: 16,
    justifyContent: 'center'
  },
  modalCard: {
    maxHeight: '78%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: 14
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  modalClose: {
    color: colors.primary,
    fontWeight: '800'
  },
  modalHint: {
    marginTop: 4,
    marginBottom: 10
  },
  modalAvailabilityFilterRow: {
    marginBottom: 10,
    flexDirection: 'row',
    gap: 8
  },
  modalList: {
    marginTop: 2
  },
  modalListContent: {
    gap: 8,
    paddingBottom: 4
  },
  grillerCard: {
    borderColor: '#F0F2F5'
  },
  grillerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  grillerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#F6F6F6'
  },
  grillerBody: {
    flex: 1,
    gap: 1
  },
  grillerName: {
    fontSize: 16
  },
  grillerAvailability: {
    fontWeight: '800'
  },
  grillerAction: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center'
  },
  grillerActionLabel: {
    color: '#FFFFFF',
    fontWeight: '800'
  }
});
