import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

import { grillerzApi } from '../../api/grillerzApi';
import { AppCard } from '../../components/ui/AppCard';
import { AppChip } from '../../components/ui/AppChip';
import { ReliableImage } from '../../components/ui/ReliableImage';
import { ReliableImageBackground } from '../../components/ui/ReliableImageBackground';
import { OFFLINE_DEMO_MODE } from '../../config/api';
import { getFallbackEventsByChef } from '../../data/grillerEvents';
import { getFallbackChefMenuItems } from '../../data/chefMenuItems';
import { getFallbackChefPackages } from '../../data/chefPackages';
import { getDishImageByName, getGrillerVideos, getYouTubeThumbnail } from '../../data/mediaLibrary';
import { getLocalAvatarUriByChef, getLocalCoverUriByChef, getLocalDishUriByName, getLocalGalleryUriByChef, getLocalVideoThumbUri } from '../../data/localMedia';
import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomNav } from '../../components/ui/BottomNav';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { ChefPackage, ChefReview, ChefVideo, GrillerEvent } from '../../types/domain';
import { getChefAvatarUrl, getChefCoverUrl } from '../../utils/chefMedia';
import { getReliableMediaUrl } from '../../utils/reliableMedia';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

type SelectedMenuItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

const fallbackReviewsByChefId: Record<string, ChefReview[]> = {
  'erick-martinez': [
    {
      id: 'fallback-r1',
      chefId: 'erick-martinez',
      authorName: 'Ana R.',
      dateLabel: 'Hace 2 dias',
      rating: 5,
      comment: 'Excelente servicio y carne en su punto.',
      createdAt: '2026-02-12T10:00:00.000Z'
    },
    {
      id: 'fallback-r2',
      chefId: 'erick-martinez',
      authorName: 'Jorge M.',
      dateLabel: 'Hace 1 semana',
      rating: 5,
      comment: 'Muy profesional, puntual y limpio.',
      createdAt: '2026-02-07T13:00:00.000Z'
    }
  ],
  'carlos-bbq': [
    {
      id: 'fallback-r1',
      chefId: 'carlos-bbq',
      authorName: 'Daniel T.',
      dateLabel: 'Hace 3 dias',
      rating: 5,
      comment: 'Costillas y brisket de gran nivel.',
      createdAt: '2026-02-11T11:00:00.000Z'
    }
  ],
  'martin-asador': [
    {
      id: 'fallback-r1',
      chefId: 'martin-asador',
      authorName: 'Karla V.',
      dateLabel: 'Hace 2 dias',
      rating: 5,
      comment: 'Ahumado espectacular, gran presentacion.',
      createdAt: '2026-02-12T09:00:00.000Z'
    }
  ],
  'luis-bbq': [
    {
      id: 'fallback-r1',
      chefId: 'luis-bbq',
      authorName: 'Jose P.',
      dateLabel: 'Hace 4 dias',
      rating: 4,
      comment: 'Muy buen asado y buena actitud.',
      createdAt: '2026-02-10T12:00:00.000Z'
    }
  ],
  'cories-bbq': [
    {
      id: 'fallback-r1',
      chefId: 'cories-bbq',
      authorName: 'Majo F.',
      dateLabel: 'Hace 3 dias',
      rating: 5,
      comment: 'Ribeye jugoso y atencion impecable.',
      createdAt: '2026-02-11T08:40:00.000Z'
    }
  ]
};

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

function extractYouTubeVideoId(rawValue?: string) {
  const value = String(rawValue ?? '').trim();
  if (!value) {
    return '';
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] ?? '';
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const directId = url.searchParams.get('v')?.trim();
      if (directId) {
        return directId;
      }

      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        return parts[1] ?? '';
      }
    }
  } catch {
    return '';
  }

  return '';
}

export function Profile({ navigation }: Props) {
  const {
    selectedChef,
    isFavoriteChef,
    toggleFavoriteChef,
    focusedEventId,
    setFocusedEventId,
    updateBookingDraft
  } = useAppState();
  const isFavorite = isFavoriteChef(selectedChef.id);
  const coverUrl = getChefCoverUrl(selectedChef);
  const avatarUrl = getChefAvatarUrl(selectedChef);
  const coverFallbackUrl = getLocalCoverUriByChef(selectedChef.id);
  const avatarFallbackUrl = getLocalAvatarUriByChef(selectedChef.id);
  const galleryImages = (selectedChef.gallery.length > 0
    ? selectedChef.gallery.map((item, index) =>
        getReliableMediaUrl(item, getLocalGalleryUriByChef(selectedChef.id, index))
      )
    : [0, 1, 2].map((index) => getLocalGalleryUriByChef(selectedChef.id, index)));
  const [grillerVideos, setGrillerVideos] = useState<ChefVideo[]>(getGrillerVideos(selectedChef.id));
  const [chefMenuItems, setChefMenuItems] = useState(getFallbackChefMenuItems(selectedChef.id));
  const [selectedMenuQuantities, setSelectedMenuQuantities] = useState<Record<string, number>>({});
  const [chefPackages, setChefPackages] = useState<ChefPackage[]>(getFallbackChefPackages(selectedChef.id));
  const [reviews, setReviews] = useState<ChefReview[]>(fallbackReviewsByChefId[selectedChef.id] ?? []);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<ChefVideo | null>(null);
  const [chefEvents, setChefEvents] = useState<GrillerEvent[]>(getFallbackEventsByChef(selectedChef.id));
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoErrorNotice, setVideoErrorNotice] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoHasRendered, setVideoHasRendered] = useState(false);
  const activeVideoId = extractYouTubeVideoId(selectedVideo?.videoId) || extractYouTubeVideoId(selectedVideo?.youtubeUrl) || 'M7lc1UVf-VE';
  const watchPlayerUrl = `https://www.youtube.com/watch?v=${activeVideoId}&autoplay=1&playsinline=1`;
  const selectedMenuItems = useMemo<SelectedMenuItem[]>(() => {
    return chefMenuItems
      .map((item) => {
        const quantity = selectedMenuQuantities[item.id] ?? 0;
        return {
          id: item.id,
          name: item.name,
          quantity,
          unitPrice: item.price,
          total: item.price * quantity
        };
      })
      .filter((item) => item.quantity > 0);
  }, [chefMenuItems, selectedMenuQuantities]);
  const selectedPackage = useMemo(
    () => chefPackages.find((item) => item.id === selectedPackageId && item.isActive) ?? null,
    [chefPackages, selectedPackageId]
  );
  const packageSelectionTotal = selectedPackage?.price ?? 0;
  const menuSelectionTotal = selectedMenuItems.reduce((sum, item) => sum + item.total, 0);
  const combinedSelectionTotal = menuSelectionTotal + packageSelectionTotal;
  const hasMenuSelection = selectedMenuItems.length > 0;
  const hasAnySelection = Boolean(selectedPackage) || hasMenuSelection;

  useEffect(() => {
    setChefMenuItems(getFallbackChefMenuItems(selectedChef.id));
    setSelectedMenuQuantities({});
    const nextPackages = getFallbackChefPackages(selectedChef.id);
    setChefPackages(nextPackages);
    setSelectedPackageId('');
  }, [selectedChef.id]);

  useEffect(() => {
    if (!selectedPackageId) {
      return;
    }

    if (!chefPackages.some((item) => item.id === selectedPackageId && item.isActive)) {
      setSelectedPackageId('');
    }
  }, [chefPackages, selectedPackageId]);

  function openVideoModal(video: ChefVideo) {
    setSelectedVideo(video);
    setShowVideoModal(true);
    setIsVideoLoading(true);
    setVideoHasRendered(false);
    setVideoErrorNotice(null);
  }

  function closeVideoModal() {
    setShowVideoModal(false);
    setSelectedVideo(null);
    setVideoHasRendered(false);
    setVideoErrorNotice(null);
  }

  function openEventModal(event: GrillerEvent) {
    navigation.navigate('EventDetails', { eventId: event.id, chefId: event.chefId });
  }

  function updateMenuItemQuantity(itemId: string, nextQuantity: number) {
    const clamped = Math.max(0, Math.min(8, nextQuantity));
    setSelectedMenuQuantities((prev) => {
      if (clamped === 0) {
        const { [itemId]: _removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [itemId]: clamped
      };
    });
  }

  function reserveMenuSelection() {
    const selections: string[] = [];
    if (selectedPackage) {
      selections.push(`Paquete: ${selectedPackage.name}`);
    }
    if (hasMenuSelection) {
      selections.push(`Platillos: ${selectedMenuItems.map((item) => `${item.quantity}x ${item.name}`).join(', ')}`);
    }
    const packageName = selections.join(' + ') || 'Servicio personalizado';
    const serviceFee = combinedSelectionTotal > 0 ? combinedSelectionTotal : selectedChef.basePrice;

    updateBookingDraft({
      packageName,
      customServiceFee: serviceFee
    });
    navigation.navigate('Schedule');
  }

  useEffect(() => {
    let active = true;
    setReviews(fallbackReviewsByChefId[selectedChef.id] ?? []);

    if (OFFLINE_DEMO_MODE) {
      return () => {
        active = false;
      };
    }

    async function loadReviews() {
      try {
        const remoteReviews = await grillerzApi.getChefReviews(selectedChef.id);
        if (active) {
          setReviews(remoteReviews);
        }
      } catch {
        // keep local fallback
      }
    }

    void loadReviews();

    return () => {
      active = false;
    };
  }, [selectedChef.id]);

  useEffect(() => {
    let active = true;
    setGrillerVideos(getGrillerVideos(selectedChef.id));

    if (OFFLINE_DEMO_MODE) {
      return () => {
        active = false;
      };
    }

    async function loadVideos() {
      try {
        const remoteVideos = await grillerzApi.getChefVideos(selectedChef.id);
        if (active) {
          setGrillerVideos(remoteVideos);
        }
      } catch {
        // keep local fallback
      }
    }

    void loadVideos();

    return () => {
      active = false;
    };
  }, [selectedChef.id]);

  useEffect(() => {
    let active = true;
    setChefPackages(getFallbackChefPackages(selectedChef.id));

    if (OFFLINE_DEMO_MODE) {
      return () => {
        active = false;
      };
    }

    async function loadPackages() {
      try {
        const remotePackages = await grillerzApi.getChefPackages(selectedChef.id);
        if (active) {
          setChefPackages(remotePackages);
        }
      } catch {
        // keep local fallback
      }
    }

    void loadPackages();

    return () => {
      active = false;
    };
  }, [selectedChef.id]);

  useEffect(() => {
    let active = true;
    setChefEvents(getFallbackEventsByChef(selectedChef.id));

    if (OFFLINE_DEMO_MODE) {
      return () => {
        active = false;
      };
    }

    async function loadEvents() {
      try {
        const remoteEvents = await grillerzApi.getEvents({
          chefId: selectedChef.id,
          status: 'Publicado'
        });
        if (active) {
          setChefEvents(remoteEvents);
        }
      } catch {
        // keep local fallback
      }
    }

    void loadEvents();

    return () => {
      active = false;
    };
  }, [selectedChef.id]);

  useEffect(() => {
    if (!focusedEventId) {
      return;
    }

    const focusedEvent = chefEvents.find((item) => item.id === focusedEventId);
    if (!focusedEvent) {
      return;
    }

    openEventModal(focusedEvent);
    setFocusedEventId(null);
  }, [chefEvents, focusedEventId, setFocusedEventId]);

  useEffect(() => {
    if (!showVideoModal || !isVideoLoading) {
      return;
    }

    const timeout = setTimeout(() => {
      setIsVideoLoading(false);
    }, 6000);

    return () => {
      clearTimeout(timeout);
    };
  }, [activeVideoId, isVideoLoading, showVideoModal]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader
            title="Perfil"
            onBack={() => navigation.goBack()}
            rightAction="Chat"
            onRightAction={() => navigation.navigate('Chat')}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.hero}>
              <ReliableImageBackground uri={coverUrl} fallbackUri={coverFallbackUrl} style={styles.heroMedia} imageStyle={styles.heroMediaImage}>
                <View style={styles.heroShade} />
              </ReliableImageBackground>

              <Pressable style={styles.favoriteHeroButton} onPress={() => toggleFavoriteChef(selectedChef.id)}>
                <MaterialCommunityIcons name={isFavorite ? 'heart' : 'heart-outline'} size={16} color={colors.primary} />
                <Text style={styles.favoriteHeroLabel}>{isFavorite ? 'Favorito' : 'Guardar'}</Text>
              </Pressable>

              <ReliableImage uri={avatarUrl} fallbackUri={avatarFallbackUrl} style={styles.avatar} />
              <View style={styles.heroCopy}>
                <Text style={styles.heroName}>{selectedChef.name}</Text>
                <Text style={styles.heroMeta}>{selectedChef.title}  -  {selectedChef.city}</Text>
                <View style={styles.heroRatingRow}>
                  <MaterialCommunityIcons name="fire" size={16} color={colors.primary} />
                  <Text style={styles.heroRating}>{selectedChef.rating}</Text>
                  <Text style={styles.heroReviews}>({selectedChef.reviews} resenas)</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <AppCard style={styles.statCard}>
                <Text style={styles.statValue}>{selectedChef.stats.services}</Text>
                <Text style={styles.statLabel}>Servicios</Text>
              </AppCard>
              <AppCard style={styles.statCard}>
                <Text style={styles.statValue}>{selectedChef.stats.clients}</Text>
                <Text style={styles.statLabel}>Clientes</Text>
              </AppCard>
              <AppCard style={styles.statCard}>
                <Text style={styles.statValue}>{selectedChef.stats.years}</Text>
                <Text style={styles.statLabel}>Anos</Text>
              </AppCard>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Especializaciones</Text>
              <View style={styles.tagsWrap}>
                {selectedChef.specialties.map((item) => (
                  <AppChip key={item} label={item} selected />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sobre el griller</Text>
              <Text style={styles.bio}>{selectedChef.bio}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Menu visual</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
                {galleryImages.map((imageUrl, index) => (
                  <ReliableImageBackground
                    key={`${selectedChef.id}-gallery-${index}`}
                    uri={imageUrl}
                    fallbackUri={getLocalGalleryUriByChef(selectedChef.id, index)}
                    style={styles.galleryCard}
                    imageStyle={styles.galleryCardImage}
                  >
                    <View style={styles.galleryShade}>
                      <Text style={styles.galleryLabel}>Corte #{index + 1}</Text>
                    </View>
                  </ReliableImageBackground>
                ))}
                {galleryImages.length === 0 ? <Text style={styles.emptyReviews}>No hay imagenes disponibles.</Text> : null}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cortes y platillos</Text>
              <View style={styles.menuList}>
                {chefMenuItems.map((item) => (
                  <AppCard key={item.id} style={styles.menuCard}>
                    <View style={styles.menuCardRow}>
                      <ReliableImage
                        uri={getDishImageByName(item.name)}
                        fallbackUri={getLocalDishUriByName(item.name)}
                        style={styles.menuCardThumb}
                      />
                      <View style={styles.menuCardBody}>
                        <View style={styles.menuCardTop}>
                          <Text style={styles.menuCardName}>{item.name}</Text>
                          <Text style={styles.menuCardPrice}>${item.price.toLocaleString('es-MX')} MXN</Text>
                        </View>
                        <Text style={styles.menuCardDetails}>{item.details}</Text>
                        <View style={styles.menuCardMeta}>
                          <AppChip label={item.category} />
                        </View>
                        <View style={styles.menuQtyRow}>
                          <View style={styles.menuQtyActions}>
                            <Pressable
                              style={[styles.eventSeatButton, (selectedMenuQuantities[item.id] ?? 0) === 0 ? styles.eventSeatButtonDisabled : null]}
                              onPress={() => updateMenuItemQuantity(item.id, (selectedMenuQuantities[item.id] ?? 0) - 1)}
                              disabled={(selectedMenuQuantities[item.id] ?? 0) === 0}
                            >
                              <Text style={styles.eventSeatButtonLabel}>-</Text>
                            </Pressable>
                            <Text style={styles.menuQtyValue}>{selectedMenuQuantities[item.id] ?? 0}</Text>
                            <Pressable style={styles.eventSeatButton} onPress={() => updateMenuItemQuantity(item.id, (selectedMenuQuantities[item.id] ?? 0) + 1)}>
                              <Text style={styles.eventSeatButtonLabel}>+</Text>
                            </Pressable>
                          </View>
                          <Text style={styles.menuLineTotal}>
                            ${(((selectedMenuQuantities[item.id] ?? 0) * item.price)).toLocaleString('es-MX')} MXN
                          </Text>
                        </View>
                      </View>
                    </View>
                  </AppCard>
                ))}
                {chefMenuItems.length === 0 ? (
                  <Text style={styles.emptyReviews}>Este griller aun no publica cortes o platillos.</Text>
                ) : null}
                {chefMenuItems.length > 0 ? (
                  <AppCard style={styles.menuSelectionCard}>
                    <Text style={styles.menuSelectionTitle}>Seleccion de cortes</Text>
                    <Text style={styles.menuSelectionHint}>
                      Elige uno o varios cortes/platillos y combínalos con paquete si lo deseas.
                    </Text>
                    <Text style={styles.menuSelectionTotal}>
                      Total seleccionado: ${menuSelectionTotal.toLocaleString('es-MX')} MXN
                    </Text>
                  </AppCard>
                ) : null}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Paquetes y precios</Text>
              <View style={styles.packagesList}>
                {chefPackages.filter((item) => item.isActive).map((item) => {
                  const selected = item.id === selectedPackageId;
                  return (
                    <Pressable key={item.id} onPress={() => setSelectedPackageId((prev) => (prev === item.id ? '' : item.id))}>
                      <AppCard style={[styles.packageCard, selected ? styles.packageCardSelected : null]}>
                        <View style={styles.packageTopRow}>
                          <Text style={styles.packageName}>{item.name}</Text>
                          {selected ? <AppChip label="Seleccionado" selected /> : null}
                        </View>
                        <Text style={styles.packageDetails}>{item.details}</Text>
                        <Text style={styles.packagePrice}>${item.price.toLocaleString('es-MX')} MXN</Text>
                      </AppCard>
                    </Pressable>
                  );
                })}
                {chefPackages.filter((item) => item.isActive).length === 0 ? (
                  <Text style={styles.emptyReviews}>Este griller aun no publica paquetes.</Text>
                ) : null}
                <AppCard style={styles.menuSelectionCard}>
                  <Text style={styles.menuSelectionTitle}>Resumen de compra</Text>
                  <Text style={styles.menuSelectionHint}>
                    Paquete: {selectedPackage ? selectedPackage.name : 'Ninguno'}
                  </Text>
                  <Text style={styles.menuSelectionHint}>
                    Platillos: {hasMenuSelection ? selectedMenuItems.length : 0} seleccionado(s)
                  </Text>
                  <Text style={styles.menuSelectionTotal}>
                    Total a cobrar: ${combinedSelectionTotal > 0 ? combinedSelectionTotal.toLocaleString('es-MX') : selectedChef.basePrice.toLocaleString('es-MX')} MXN
                  </Text>
                </AppCard>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Eventos Grillerz</Text>
              <View style={styles.eventsList}>
                {chefEvents.map((event) => {
                  const eventImage = getDishImageByName(event.menu[0] ?? event.title);
                  const eventImageFallback = getLocalDishUriByName(event.menu[0] ?? event.title);
                  return (
                    <AppCard key={event.id} padded={false} style={styles.eventCard}>
                      <ReliableImageBackground
                        uri={eventImage}
                        fallbackUri={eventImageFallback}
                        style={styles.eventImage}
                        imageStyle={styles.eventImageStyle}
                      >
                        <View style={styles.eventImageShade} />
                        <View style={styles.eventImageTopRow}>
                          <AppChip label={formatEventDateLabel(event.dateKey)} selected />
                          <AppChip label={`${event.seatsAvailable}/${event.capacityTotal}`} selected />
                        </View>
                        <View>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <Text style={styles.eventMeta}>{event.timeLabel} · {event.venueName}</Text>
                        </View>
                      </ReliableImageBackground>
                      <View style={styles.eventBody}>
                        <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>
                        <View style={styles.eventTagsRow}>
                          {event.menu.slice(0, 3).map((item) => (
                            <AppChip key={`${event.id}-${item}`} label={item} />
                          ))}
                        </View>
                        <View style={styles.eventFooter}>
                          <Text style={styles.eventPrice}>${event.pricePerPerson.toLocaleString('es-MX')} MXN p/p</Text>
                          <Pressable style={styles.eventAction} onPress={() => openEventModal(event)}>
                            <Text style={styles.eventActionLabel}>Ver detalle</Text>
                          </Pressable>
                        </View>
                      </View>
                    </AppCard>
                  );
                })}
                {chefEvents.length === 0 ? <Text style={styles.emptyReviews}>Este griller aun no publica eventos.</Text> : null}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Videos del griller (YouTube)</Text>
              <View style={styles.videosList}>
                {grillerVideos.map((video) => (
                  <AppCard key={video.id} padded={false} style={styles.videoCard} onPress={() => openVideoModal(video)}>
                    <ReliableImageBackground
                      uri={getYouTubeThumbnail(video.videoId)}
                      fallbackUri={getLocalVideoThumbUri(video.videoId)}
                      style={styles.videoThumb}
                      imageStyle={styles.videoThumbImage}
                    >
                      <View style={styles.videoPlayBadge}>
                        <MaterialCommunityIcons name="play" size={16} color="#FFFFFF" />
                      </View>
                    </ReliableImageBackground>
                    <View style={styles.videoBody}>
                      <Text style={styles.videoTitle}>{video.title}</Text>
                      <Text style={styles.videoSubtitle}>{video.subtitle}</Text>
                      <Text style={styles.videoAction}>Ver en YouTube</Text>
                    </View>
                  </AppCard>
                ))}
                {grillerVideos.length === 0 ? <Text style={styles.emptyReviews}>Este griller aun no sube videos.</Text> : null}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resenas ({selectedChef.reviews})</Text>
              <View style={styles.reviewsList}>
                {reviews.map((item) => (
                  <AppCard key={`${selectedChef.id}-${item.id}`} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarLabel}>{item.authorName.charAt(0)}</Text>
                      </View>
                      <View style={styles.reviewHeaderCopy}>
                        <Text style={styles.reviewAuthor}>{item.authorName}</Text>
                        <Text style={styles.reviewDate}>{item.dateLabel}</Text>
                      </View>
                      <View style={styles.reviewRatingRow}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <MaterialCommunityIcons
                            key={`${item.id}-fire-${index}`}
                            name="fire"
                            size={14}
                            color={index < item.rating ? colors.primary : '#F2CFC9'}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{item.comment}</Text>
                  </AppCard>
                ))}
                {reviews.length === 0 ? <Text style={styles.emptyReviews}>Aun no hay resenas publicadas.</Text> : null}
              </View>
            </View>

            <PrimaryButton
              label={hasAnySelection ? 'Continuar con selección' : 'Continuar sin selección'}
              onPress={reserveMenuSelection}
            />
          </ScrollView>
        </View>

        <Modal visible={showVideoModal} animationType="fade" transparent onRequestClose={closeVideoModal}>
          <View style={styles.videoModalBackdrop}>
            <View style={styles.videoModalCard}>
              <View style={styles.videoModalHeader}>
                <Text style={styles.videoModalTitle}>{selectedVideo?.title ?? 'Video del griller'}</Text>
                <Pressable onPress={closeVideoModal}>
                  <Text style={styles.videoModalClose}>Cerrar</Text>
                </Pressable>
              </View>
              {videoErrorNotice ? <Text style={styles.videoNoticeText}>{videoErrorNotice}</Text> : null}
              {selectedVideo ? (
                <View style={styles.videoPlayerWrap}>
                  <WebView
                    source={{
                      uri: watchPlayerUrl
                    }}
                    originWhitelist={['*']}
                    style={styles.videoWebview}
                    javaScriptEnabled
                    domStorageEnabled
                    allowsInlineMediaPlayback
                    allowsFullscreenVideo
                    mediaPlaybackRequiresUserAction={false}
                    setSupportMultipleWindows={false}
                    thirdPartyCookiesEnabled
                    sharedCookiesEnabled
                    onLoadStart={() => {
                      if (!videoHasRendered) {
                        setIsVideoLoading(true);
                      }
                    }}
                    onLoadEnd={() => {
                      setVideoHasRendered(true);
                      setIsVideoLoading(false);
                    }}
                    onLoadProgress={({ nativeEvent }) => {
                      if (nativeEvent.progress >= 0.2) {
                        setVideoHasRendered(true);
                        setIsVideoLoading(false);
                      }
                    }}
                    onNavigationStateChange={(state) => {
                      if (!state.loading) {
                        setVideoHasRendered(true);
                        setIsVideoLoading(false);
                      }
                    }}
                    onError={() => {
                      setVideoErrorNotice('No se pudo reproducir el video dentro de la app. Puedes abrirlo directo en YouTube.');
                      setIsVideoLoading(false);
                    }}
                    onHttpError={() => {
                      setVideoErrorNotice('YouTube bloqueó ese enlace en WebView. Ábrelo en YouTube para ver el video completo.');
                      setIsVideoLoading(false);
                    }}
                    onShouldStartLoadWithRequest={(request) => {
                      const url = request.url;

                      if (url.startsWith('about:blank') || url.startsWith('https://') || url.startsWith('http://')) {
                        return true;
                      }

                      void Linking.openURL(url);
                      return false;
                    }}
                    />
                  {isVideoLoading ? (
                    <View style={styles.videoLoadingOverlay}>
                      <ActivityIndicator color="#FFFFFF" />
                      <Text style={styles.videoLoadingText}>Cargando video...</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
              {selectedVideo ? (
                <Pressable style={styles.videoExternalLink} onPress={() => Linking.openURL(selectedVideo.youtubeUrl)}>
                  <Text style={styles.videoExternalLinkLabel}>Abrir en YouTube</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </Modal>

        <BottomNav onNavigate={(route) => navigation.navigate(route)} />
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
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 20,
    gap: 16
  },
  hero: {
    minHeight: 200,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    overflow: 'hidden'
  },
  heroMedia: {
    ...StyleSheet.absoluteFillObject
  },
  heroMediaImage: {
    borderRadius: 20
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 8, 0.42)'
  },
  favoriteHeroButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    minHeight: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FFD4CC',
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  favoriteHeroLabel: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800'
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 68,
    backgroundColor: '#FFFFFF'
  },
  heroCopy: {
    flex: 1,
    gap: 2
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 29,
    lineHeight: 32,
    fontWeight: '900'
  },
  heroMeta: {
    color: '#FFE2DC',
    fontWeight: '700'
  },
  heroRatingRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  heroRating: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  heroReviews: {
    color: '#FFD9D3',
    fontWeight: '700'
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8
  },
  statCard: {
    flex: 1,
    minHeight: 74,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundMuted
  },
  statValue: {
    color: colors.textStrong,
    fontSize: 22,
    fontWeight: '900'
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  section: {
    gap: 8
  },
  sectionTitle: {
    color: colors.textStrong,
    fontSize: 20,
    fontWeight: '900'
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  bio: {
    color: colors.textMuted,
    lineHeight: 22,
    fontSize: 15
  },
  galleryRow: {
    gap: 10,
    paddingRight: 10
  },
  galleryCard: {
    width: 180,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end'
  },
  galleryCardImage: {
    borderRadius: 12
  },
  galleryShade: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(15, 10, 8, 0.45)'
  },
  galleryLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  },
  menuList: {
    gap: 10
  },
  menuCard: {
    backgroundColor: colors.backgroundMuted
  },
  menuCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  menuCardThumb: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: '#F3F4F6'
  },
  menuCardBody: {
    flex: 1,
    gap: 4
  },
  menuCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8
  },
  menuCardName: {
    flex: 1,
    color: colors.textStrong,
    fontWeight: '900',
    fontSize: 15
  },
  menuCardPrice: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 14
  },
  menuCardDetails: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600'
  },
  menuCardMeta: {
    marginTop: 2,
    flexDirection: 'row'
  },
  menuQtyRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  menuQtyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  menuQtyValue: {
    minWidth: 22,
    textAlign: 'center',
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '900'
  },
  menuLineTotal: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '800'
  },
  menuSelectionCard: {
    marginTop: 2,
    gap: 8,
    backgroundColor: '#FFF8F7'
  },
  menuSelectionTitle: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '900'
  },
  menuSelectionHint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600'
  },
  menuSelectionTotal: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '900'
  },
  videosList: {
    gap: 10
  },
  eventsList: {
    gap: 10
  },
  eventCard: {
    overflow: 'hidden',
    backgroundColor: colors.backgroundMuted
  },
  eventImage: {
    minHeight: 160,
    justifyContent: 'space-between',
    padding: 10
  },
  eventImageStyle: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  eventImageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 8, 0.42)'
  },
  eventImageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  eventTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 22,
    lineHeight: 26
  },
  eventMeta: {
    marginTop: 4,
    color: '#FFD9D3',
    fontSize: 12,
    fontWeight: '700'
  },
  eventBody: {
    padding: 10,
    gap: 8
  },
  eventDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600'
  },
  eventTagsRow: {
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
  eventPrice: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '900'
  },
  eventAction: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF'
  },
  eventActionLabel: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '800'
  },
  packagesList: {
    gap: 10
  },
  packageCard: {
    gap: 6,
    backgroundColor: colors.backgroundMuted
  },
  packageCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5F4'
  },
  packageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  packageName: {
    color: colors.textStrong,
    fontWeight: '800',
    fontSize: 16
  },
  packageDetails: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  packagePrice: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 18
  },
  videoCard: {
    overflow: 'hidden',
    backgroundColor: colors.backgroundMuted
  },
  videoThumb: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoThumbImage: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  videoPlayBadge: {
    width: 36,
    height: 36,
    borderRadius: 36,
    backgroundColor: 'rgba(222, 45, 37, 0.9)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoBody: {
    padding: 10,
    gap: 3
  },
  videoTitle: {
    color: colors.textStrong,
    fontWeight: '800',
    fontSize: 14
  },
  videoSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600'
  },
  videoAction: {
    marginTop: 4,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800'
  },
  reviewsList: {
    gap: 10
  },
  reviewCard: {
    backgroundColor: colors.backgroundMuted,
    gap: 8
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  reviewAvatar: {
    width: 30,
    height: 30,
    borderRadius: 30,
    backgroundColor: '#FFE5E2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  reviewAvatarLabel: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900'
  },
  reviewHeaderCopy: {
    flex: 1,
    gap: 1
  },
  reviewAuthor: {
    color: colors.textStrong,
    fontWeight: '800',
    fontSize: 13
  },
  reviewDate: {
    color: colors.textSoft,
    fontWeight: '600',
    fontSize: 11
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  reviewComment: {
    color: colors.textMuted,
    lineHeight: 19,
    fontSize: 13,
    fontWeight: '600'
  },
  emptyReviews: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '600'
  },
  eventModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 10, 8, 0.7)',
    justifyContent: 'flex-end'
  },
  eventModalCard: {
    height: '92%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  eventModalHeader: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  eventModalTitle: {
    color: colors.textStrong,
    fontWeight: '900',
    fontSize: 18
  },
  eventModalClose: {
    color: colors.primary,
    fontWeight: '800'
  },
  eventModalContent: {
    flex: 1
  },
  eventModalContentInner: {
    flexGrow: 1,
    padding: 14,
    gap: 12,
    paddingBottom: 24
  },
  eventModalMedia: {
    minHeight: 190,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 12
  },
  eventModalMediaImage: {
    borderRadius: 14
  },
  eventModalMediaBottom: {
    gap: 2
  },
  eventModalEventTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900'
  },
  eventModalEventMeta: {
    color: '#FFD9D3',
    fontSize: 13,
    fontWeight: '700'
  },
  eventHostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  eventHostName: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '900'
  },
  eventHostCity: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700'
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  eventModalText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600'
  },
  eventLocationText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600'
  },
  eventMapLink: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12
  },
  eventModalStats: {
    flexDirection: 'row',
    gap: 8
  },
  eventModalStatCard: {
    flex: 1,
    minHeight: 68,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },
  eventModalStatLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700'
  },
  eventModalStatValue: {
    color: colors.textStrong,
    fontSize: 17,
    fontWeight: '900'
  },
  eventModalBlock: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 8
  },
  eventModalBlockTitle: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '900'
  },
  eventModalTextMuted: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600'
  },
  eventVideoButton: {
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
  eventVideoButtonLabel: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '800'
  },
  eventAddOnList: {
    gap: 8
  },
  eventAddOnRow: {
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
  eventAddOnCopy: {
    flex: 1,
    gap: 2
  },
  eventAddOnName: {
    color: colors.textStrong,
    fontSize: 13,
    fontWeight: '800'
  },
  eventAddOnPrice: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700'
  },
  eventAddOnActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  eventAddOnQuantity: {
    minWidth: 20,
    textAlign: 'center',
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '900'
  },
  eventSeatRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  eventSeatButton: {
    width: 34,
    height: 34,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  eventSeatButtonDisabled: {
    opacity: 0.4
  },
  eventSeatButtonLabel: {
    color: colors.textStrong,
    fontSize: 19,
    fontWeight: '800'
  },
  eventSeatValue: {
    minWidth: 24,
    textAlign: 'center',
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: '900'
  },
  eventSeatTotal: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 4
  },
  eventSeatBreakdown: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  eventNoticeText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700'
  },
  eventCheckoutButtonWrap: {
    marginTop: 4
  },
  videoModalBackdrop: {
    flex: 1,
    backgroundColor: '#000000'
  },
  videoModalCard: {
    flex: 1,
    backgroundColor: '#000000'
  },
  videoModalHeader: {
    minHeight: 46,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  videoModalTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13
  },
  videoModalClose: {
    color: colors.primary,
    fontWeight: '800'
  },
  videoNoticeText: {
    color: '#F3F4F6',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 4
  },
  videoWebview: {
    flex: 1,
    backgroundColor: '#000000'
  },
  videoPlayerWrap: {
    flex: 1,
    position: 'relative'
  },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    gap: 8
  },
  videoLoadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  videoExternalLink: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#080D17'
  },
  videoExternalLinkLabel: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800'
  }
});
