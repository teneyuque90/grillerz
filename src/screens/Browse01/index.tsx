import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

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
const categories = ['Top', 'Costillas', 'Tomahawk', 'Parrilla', 'Ahumados', 'Brisket', 'Cabrito', 'Mariscos', 'Rib Eyes', 'Arrachera', 'Picana', 'T-Bone'];

export function Browse01({ navigation }: Props) {
  const { chefs, selectChef, authUser } = useAppState();
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [showGrillersModal, setShowGrillersModal] = useState(false);
  const [grillerEvents, setGrillerEvents] = useState<GrillerEvent[]>([]);
  const [eventSeatsById, setEventSeatsById] = useState<Record<string, number>>({});
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventNotice, setEventNotice] = useState<string | null>(null);
  const [reservingEventId, setReservingEventId] = useState<string | null>(null);
  const heroItem = featured[0];
  const heroChef = chefs.find((chef) => chef.id === heroItem.chefId);
  const heroCoverUrl = getChefCoverUrl(heroChef);
  const heroFallbackUrl = getLocalCoverUriByChef(heroChef?.id ?? heroItem.chefId);
  const nearestCity = authUser?.city ?? 'Nuevo Laredo';

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
  const visibleFeatured = useMemo(() => {
    if (activeCategory === 'Top') {
      return featured;
    }

    const normalizedCategory = activeCategory.toLowerCase();
    const filtered = featured.filter((item) => item.dishName.toLowerCase().includes(normalizedCategory));
    return filtered.length > 0 ? filtered : featured;
  }, [activeCategory]);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      setIsLoadingEvents(true);
      setEventNotice(null);

      if (OFFLINE_DEMO_MODE) {
        const localEvents = getFallbackEvents('Publicado');
        if (active) {
          setGrillerEvents(localEvents);
          setEventSeatsById(Object.fromEntries(localEvents.map((item) => [item.id, item.minSeatsPerReservation])));
          setIsLoadingEvents(false);
        }
        return;
      }

      try {
        const remoteEvents = await grillerzApi.getEvents({ status: 'Publicado' });
        if (active) {
          setGrillerEvents(remoteEvents);
          setEventSeatsById(Object.fromEntries(remoteEvents.map((item) => [item.id, item.minSeatsPerReservation])));
        }
      } catch {
        const localEvents = getFallbackEvents('Publicado');
        if (active) {
          setGrillerEvents(localEvents);
          setEventSeatsById(Object.fromEntries(localEvents.map((item) => [item.id, item.minSeatsPerReservation])));
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

  function updateEventSeats(event: GrillerEvent, delta: number) {
    setEventSeatsById((prev) => {
      const current = prev[event.id] ?? event.minSeatsPerReservation;
      const next = Math.min(event.maxSeatsPerReservation, Math.max(event.minSeatsPerReservation, current + delta));
      return {
        ...prev,
        [event.id]: next
      };
    });
  }

  async function reserveEvent(event: GrillerEvent) {
    if (authUser?.role === 'griller') {
      setEventNotice('Los eventos se apartan desde cuenta Cliente.');
      return;
    }

    const seats = eventSeatsById[event.id] ?? event.minSeatsPerReservation;
    if (seats > event.seatsAvailable) {
      setEventNotice('No hay suficientes lugares disponibles para ese evento.');
      return;
    }

    setReservingEventId(event.id);
    setEventNotice(null);

    try {
      if (OFFLINE_DEMO_MODE) {
        setGrillerEvents((prev) =>
          prev.map((item) => {
            if (item.id !== event.id) {
              return item;
            }

            return {
              ...item,
              seatsAvailable: Math.max(0, item.seatsAvailable - seats)
            };
          })
        );
      } else {
        const result = await grillerzApi.reserveEventSeats(event.id, { seats });
        setGrillerEvents((prev) => prev.map((item) => (item.id === event.id ? result.event : item)));
      }

      setEventNotice(`Reserva confirmada: ${seats} lugar(es) en ${event.title}.`);
    } catch (error) {
      setEventNotice(error instanceof Error ? error.message : 'No se pudo completar la reserva del evento.');
    } finally {
      setReservingEventId(null);
    }
  }

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
          {categories.map((item) => (
            <AppChip
              key={item}
              label={item}
              selected={item === activeCategory}
              onPress={() => setActiveCategory(item)}
            />
          ))}
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

        <SectionHeader title="Eventos del griller" actionText="Ver mapa" onActionPress={() => navigation.navigate('Map')} />
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
              const seats = eventSeatsById[event.id] ?? event.minSeatsPerReservation;
              const amount = seats * event.pricePerPerson;

              return (
                <AppCard key={event.id} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventHeaderCopy}>
                      <AppText variant="section">{event.title}</AppText>
                      <AppText variant="caption" style={styles.eventSub}>
                        {event.dateKey} · {event.timeLabel} · {event.city}
                      </AppText>
                      <AppText variant="caption" style={styles.eventSub}>
                        {event.venueName} · {event.address}
                      </AppText>
                    </View>
                    <AppChip label={`${event.seatsAvailable}/${event.capacityTotal} cupos`} selected />
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
                      <AppText variant="caption">Total: ${amount.toLocaleString('es-MX')} MXN</AppText>
                    </View>
                    <View style={styles.eventActions}>
                      <View style={styles.seatStepper}>
                        <Pressable style={styles.seatButton} onPress={() => updateEventSeats(event, -1)}>
                          <AppText variant="body">-</AppText>
                        </Pressable>
                        <AppText variant="body" style={styles.seatValue}>{seats}</AppText>
                        <Pressable style={styles.seatButton} onPress={() => updateEventSeats(event, 1)}>
                          <AppText variant="body">+</AppText>
                        </Pressable>
                      </View>
                      <AppButton
                        label={reservingEventId === event.id ? 'Apartando...' : 'Apartar lugar'}
                        variant="primary"
                        style={styles.eventReserveButton}
                        labelStyle={styles.eventReserveButtonLabel}
                        disabled={event.seatsAvailable <= 0 || reservingEventId === event.id}
                        onPress={() => {
                          if (chef) {
                            selectChef(chef.id);
                          }
                          void reserveEvent(event);
                        }}
                      />
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

            <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
              {availableGrillers.map((griller) => {
                const avatarUrl = getChefAvatarUrl(griller);
                const avatarFallbackUrl = getLocalAvatarUriByChef(griller.id);
                return (
                  <AppCard key={griller.id} style={styles.grillerCard}>
                    <View style={styles.grillerRow}>
                      <ReliableImage uri={avatarUrl} fallbackUri={avatarFallbackUrl} style={styles.grillerAvatar} />
                      <View style={styles.grillerBody}>
                        <AppText variant="section" style={styles.grillerName}>{griller.name}</AppText>
                        <AppText variant="caption">{griller.city} · {griller.rating.toFixed(1)} 🔥</AppText>
                        <AppText variant="caption">Desde ${griller.basePrice.toLocaleString('es-MX')} MXN</AppText>
                      </View>
                      <Pressable
                        style={styles.grillerAction}
                        onPress={() => {
                          selectChef(griller.id);
                          setShowGrillersModal(false);
                          navigation.navigate('Schedule');
                        }}
                      >
                        <AppText variant="caption" style={styles.grillerActionLabel}>Reservar</AppText>
                      </Pressable>
                    </View>
                  </AppCard>
                );
              })}
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
    gap: AppSpacing.s8,
    paddingRight: 24
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
    gap: 10
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  eventActions: {
    alignItems: 'flex-end',
    gap: 8
  },
  eventReserveButton: {
    minHeight: 40,
    paddingHorizontal: 14
  },
  eventReserveButtonLabel: {
    fontSize: 14,
    lineHeight: 18
  },
  seatStepper: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 10
  },
  seatButton: {
    width: 22,
    height: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  seatValue: {
    minWidth: 12,
    textAlign: 'center',
    fontWeight: '800'
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
    marginTop: 4
  },
  modalList: {
    marginTop: 10
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
