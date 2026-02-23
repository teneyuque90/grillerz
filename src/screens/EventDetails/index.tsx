import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { grillerzApi } from '../../api/grillerzApi';
import { AppChip } from '../../components/ui/AppChip';
import { ReliableImageBackground } from '../../components/ui/ReliableImageBackground';
import { OFFLINE_DEMO_MODE } from '../../config/api';
import { getFallbackEventsByChef } from '../../data/grillerEvents';
import { getGrillerVideos, getDishImageByName } from '../../data/mediaLibrary';
import { getLocalDishUriByName } from '../../data/localMedia';
import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { GrillerEvent } from '../../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetails'>;

function formatEventDateLabel(dateKey: string) {
  const parsed = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return dateKey;
  }

  return parsed.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}


export function EventDetails({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { selectedChef, selectChef, authUser, startEventCheckout, setFocusedEventId } = useAppState();
  const eventId = route.params?.eventId;
  const chefIdFromRoute = route.params?.chefId;
  const [events, setEvents] = useState<GrillerEvent[]>(getFallbackEventsByChef(chefIdFromRoute ?? selectedChef.id));
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventNotice, setEventNotice] = useState<string | null>(null);
  const [eventSeats, setEventSeats] = useState(1);

  useEffect(() => {
    if (chefIdFromRoute && chefIdFromRoute !== selectedChef.id) {
      selectChef(chefIdFromRoute);
    }
  }, [chefIdFromRoute, selectChef, selectedChef.id]);

  useEffect(() => {
    let active = true;
    const resolvedChefId = chefIdFromRoute ?? selectedChef.id;

    setEvents(getFallbackEventsByChef(resolvedChefId));

    if (OFFLINE_DEMO_MODE) {
      return () => {
        active = false;
      };
    }

    async function loadEvents() {
      setIsLoadingEvents(true);
      try {
        const remoteEvents = await grillerzApi.getEvents({
          chefId: resolvedChefId,
          status: 'Publicado'
        });
        if (active) {
          setEvents(remoteEvents);
        }
      } catch {
        // keep fallback
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
  }, [chefIdFromRoute, selectedChef.id]);

  const selectedEvent = useMemo(() => {
    if (events.length === 0) {
      return null;
    }

    if (eventId) {
      return events.find((item) => item.id === eventId) ?? events[0];
    }

    return events[0];
  }, [eventId, events]);

  useEffect(() => {
    if (!selectedEvent) {
      return;
    }

    setEventSeats(selectedEvent.minSeatsPerReservation);
    setEventNotice(null);
    setFocusedEventId(null);
  }, [selectedEvent, setFocusedEventId]);

  const eventSeatsTotal = selectedEvent ? eventSeats * selectedEvent.pricePerPerson : 0;
  const eventCheckoutTotal = eventSeatsTotal;

  function openEventInMaps(address: string, city: string) {
    const query = encodeURIComponent(`${address}, ${city}`);
    void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  }

  function beginEventCheckout() {
    if (!selectedEvent) {
      return;
    }

    if (authUser?.role === 'griller') {
      setEventNotice('Aparta eventos desde una cuenta Cliente.');
      return;
    }

    if (eventSeats > selectedEvent.seatsAvailable) {
      setEventNotice('No hay suficientes lugares disponibles para ese evento.');
      return;
    }

    startEventCheckout(selectedEvent, eventSeats, {
      total: eventCheckoutTotal,
      seatsTotal: eventSeatsTotal
    });
    navigation.navigate('Payment');
  }

  const featuredVideo = selectedEvent ? getGrillerVideos(selectedEvent.chefId)[0] : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader title="Detalle del evento" onBack={() => navigation.goBack()} />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 + Math.max(90, insets.bottom + 76) }]}
            showsVerticalScrollIndicator={false}
          >
            {!selectedEvent && !isLoadingEvents ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No encontramos ese evento.</Text>
                <Text style={styles.emptyText}>Regresa al inicio y selecciona otro evento de Grillers.</Text>
              </View>
            ) : null}

            {isLoadingEvents ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Cargando evento...</Text>
              </View>
            ) : null}

            {selectedEvent ? (
              <>
                <ReliableImageBackground
                  uri={getDishImageByName(selectedEvent.menu[0] ?? selectedEvent.title)}
                  fallbackUri={getLocalDishUriByName(selectedEvent.menu[0] ?? selectedEvent.title)}
                  style={styles.hero}
                  imageStyle={styles.heroImage}
                >
                  <View style={styles.heroShade} />
                  <View style={styles.heroTopRow}>
                    <AppChip label={formatEventDateLabel(selectedEvent.dateKey)} selected />
                    <AppChip label={`${selectedEvent.seatsAvailable}/${selectedEvent.capacityTotal} cupos`} selected />
                  </View>
                  <View style={styles.heroBottom}>
                    <Text style={styles.heroTitle}>{selectedEvent.title}</Text>
                    <Text style={styles.heroMeta}>{selectedEvent.chefName} · {selectedEvent.city}</Text>
                  </View>
                </ReliableImageBackground>

                <Text style={styles.description}>{selectedEvent.description}</Text>

                <View style={styles.rowInfo}>
                  <MaterialCommunityIcons name="clock-time-four-outline" size={16} color={colors.primary} />
                  <Text style={styles.rowInfoLabel}>{selectedEvent.timeLabel} · {formatEventDateLabel(selectedEvent.dateKey)}</Text>
                </View>
                <View style={styles.rowInfo}>
                  <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.primary} />
                  <Text style={styles.rowInfoLabel}>{selectedEvent.venueName} · {selectedEvent.address}</Text>
                  <Pressable onPress={() => openEventInMaps(selectedEvent.address, selectedEvent.city)}>
                    <Text style={styles.mapLink}>Mapa</Text>
                  </Pressable>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Precio base</Text>
                    <Text style={styles.statValue}>${selectedEvent.pricePerPerson.toLocaleString('es-MX')}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Disponibles</Text>
                    <Text style={styles.statValue}>{selectedEvent.seatsAvailable}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Capacidad</Text>
                    <Text style={styles.statValue}>{selectedEvent.capacityTotal}</Text>
                  </View>
                </View>

                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Menu del evento</Text>
                  <View style={styles.chipsWrap}>
                    {selectedEvent.menu.map((item) => (
                      <AppChip key={`${selectedEvent.id}-menu-${item}`} label={item} selected />
                    ))}
                  </View>
                  <Text style={styles.blockHint}>
                    El precio del evento ya incluye este menú. Solo aparta lugares y continúa al pago.
                  </Text>
                </View>

                {featuredVideo ? (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Video del evento</Text>
                    <Text style={styles.blockHint}>Video destacado del griller para este evento.</Text>
                    <Pressable style={styles.videoButton} onPress={() => Linking.openURL(featuredVideo.youtubeUrl)}>
                      <MaterialCommunityIcons name="play-circle-outline" size={16} color={colors.primaryDark} />
                      <Text style={styles.videoButtonLabel}>Ver video en YouTube</Text>
                    </Pressable>
                  </View>
                ) : null}

                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Apartar y pagar</Text>
                  <Text style={styles.blockHint}>
                    Min: {selectedEvent.minSeatsPerReservation}, Max: {selectedEvent.maxSeatsPerReservation}. Al continuar se abre el pago.
                  </Text>
                  <View style={styles.seatsRow}>
                    <Pressable
                      style={styles.qtyButton}
                      onPress={() => setEventSeats((prev) => Math.max(selectedEvent.minSeatsPerReservation, prev - 1))}
                    >
                      <Text style={styles.qtyButtonLabel}>-</Text>
                    </Pressable>
                    <Text style={styles.qtyValue}>{eventSeats}</Text>
                    <Pressable
                      style={styles.qtyButton}
                      onPress={() => setEventSeats((prev) => Math.min(selectedEvent.maxSeatsPerReservation, prev + 1))}
                    >
                      <Text style={styles.qtyButtonLabel}>+</Text>
                    </Pressable>
                    <Text style={styles.seatsTotal}>Lugares: ${eventSeatsTotal.toLocaleString('es-MX')} MXN</Text>
                  </View>
                  <Text style={styles.breakdown}>Total a pagar: ${eventCheckoutTotal.toLocaleString('es-MX')} MXN</Text>
                  {eventNotice ? <Text style={styles.notice}>{eventNotice}</Text> : null}
                </View>
              </>
            ) : null}
          </ScrollView>
        </View>

        {selectedEvent ? (
          <View style={[styles.footer, { paddingBottom: Math.max(14, insets.bottom + 10) }]}> 
            <Text style={styles.footerTotal}>Total: ${eventCheckoutTotal.toLocaleString('es-MX')} MXN</Text>
            <PrimaryButton label="Apartar y pagar" onPress={beginEventCheckout} compact />
          </View>
        ) : null}
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
  scroll: {
    flex: 1
  },
  scrollContent: {
    paddingTop: 12,
    gap: 12
  },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 6
  },
  emptyTitle: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '900'
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600'
  },
  hero: {
    minHeight: 220,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: 12
  },
  heroImage: {
    borderRadius: 16
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 8, 0.42)'
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  heroBottom: {
    gap: 2
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900'
  },
  heroMeta: {
    color: '#FFD9D3',
    fontSize: 13,
    fontWeight: '700'
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600'
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  rowInfoLabel: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700'
  },
  mapLink: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8
  },
  statCard: {
    flex: 1,
    minHeight: 68,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: '#FFFFFF'
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700'
  },
  statValue: {
    color: colors.textStrong,
    fontSize: 17,
    fontWeight: '900'
  },
  block: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 8
  },
  blockTitle: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '900'
  },
  blockHint: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600'
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  addOnList: {
    gap: 8
  },
  addOnRow: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  addOnCopy: {
    flex: 1,
    gap: 2
  },
  addOnName: {
    color: colors.textStrong,
    fontSize: 13,
    fontWeight: '800'
  },
  addOnPrice: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700'
  },
  addOnActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  qtyButton: {
    width: 34,
    height: 34,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  qtyButtonDisabled: {
    opacity: 0.4
  },
  qtyButtonLabel: {
    color: colors.textStrong,
    fontSize: 19,
    fontWeight: '800'
  },
  qtyValue: {
    minWidth: 24,
    textAlign: 'center',
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: '900'
  },
  videoButton: {
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundMuted,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  videoButtonLabel: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '800'
  },
  seatsRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  seatsTotal: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 4
  },
  breakdown: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  notice: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700'
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 8
  },
  footerTotal: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '900'
  }
});
