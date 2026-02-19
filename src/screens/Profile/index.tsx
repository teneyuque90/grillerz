import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { getFallbackChefPackages } from '../../data/chefPackages';
import { getGrillerVideos, getYouTubeThumbnail } from '../../data/mediaLibrary';
import { getLocalAvatarUriByChef, getLocalCoverUriByChef, getLocalGalleryUriByChef, getLocalVideoThumbUri } from '../../data/localMedia';
import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomNav } from '../../components/ui/BottomNav';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { ChefPackage, ChefReview, ChefVideo } from '../../types/domain';
import { getChefAvatarUrl, getChefCoverUrl } from '../../utils/chefMedia';
import { getReliableMediaUrl } from '../../utils/reliableMedia';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

function buildYouTubeEmbedHtml(videoId: string) {
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
      iframe { border: 0; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <iframe
      src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
  </body>
</html>`;
}

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

export function Profile({ navigation }: Props) {
  const { authUser, selectedChef, isFavoriteChef, toggleFavoriteChef } = useAppState();
  const isClientView = authUser?.role === 'client';
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
  const [chefPackages, setChefPackages] = useState<ChefPackage[]>(getFallbackChefPackages(selectedChef.id));
  const [reviews, setReviews] = useState<ChefReview[]>(fallbackReviewsByChefId[selectedChef.id] ?? []);
  const [selectedPackageId, setSelectedPackageId] = useState(chefPackages[0]?.id ?? '');
  const [selectedVideo, setSelectedVideo] = useState<ChefVideo | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    const nextPackages = getFallbackChefPackages(selectedChef.id);
    setChefPackages(nextPackages);
    setSelectedPackageId(nextPackages[0]?.id ?? '');
  }, [selectedChef.id]);

  useEffect(() => {
    if (chefPackages.length === 0) {
      setSelectedPackageId('');
      return;
    }

    if (!chefPackages.some((item) => item.id === selectedPackageId)) {
      setSelectedPackageId(chefPackages[0].id);
    }
  }, [chefPackages, selectedPackageId]);

  function openVideoModal(video: ChefVideo) {
    setSelectedVideo(video);
    setShowVideoModal(true);
  }

  function closeVideoModal() {
    setShowVideoModal(false);
    setSelectedVideo(null);
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

              {isClientView ? (
                <Pressable style={styles.favoriteHeroButton} onPress={() => toggleFavoriteChef(selectedChef.id)}>
                  <MaterialCommunityIcons name={isFavorite ? 'heart' : 'heart-outline'} size={16} color={colors.primary} />
                  <Text style={styles.favoriteHeroLabel}>{isFavorite ? 'Favorito' : 'Guardar'}</Text>
                </Pressable>
              ) : null}

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
              <Text style={styles.sectionTitle}>Paquetes y precios</Text>
              <View style={styles.packagesList}>
                {chefPackages.filter((item) => item.isActive).map((item) => {
                  const selected = item.id === selectedPackageId;
                  return (
                    <Pressable key={item.id} onPress={() => setSelectedPackageId(item.id)}>
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

            <PrimaryButton label="Reservar ahora" onPress={() => navigation.navigate('Schedule')} />
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
              {selectedVideo ? (
                <WebView
                  source={{ html: buildYouTubeEmbedHtml(selectedVideo.videoId) }}
                  originWhitelist={['*']}
                  style={styles.videoWebview}
                  javaScriptEnabled
                  domStorageEnabled
                  allowsInlineMediaPlayback
                  allowsFullscreenVideo
                  mediaPlaybackRequiresUserAction={false}
                  setSupportMultipleWindows={false}
                  onShouldStartLoadWithRequest={(request) => {
                    const url = request.url;
                    if (url.startsWith('about:blank')) {
                      return true;
                    }

                    if (url.startsWith('https://www.youtube-nocookie.com/embed/')) {
                      return true;
                    }

                    if (url.startsWith('https://www.youtube.com/embed/')) {
                      return true;
                    }

                    return false;
                  }}
                />
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
  videosList: {
    gap: 10
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
  videoModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 10, 8, 0.75)',
    justifyContent: 'center',
    paddingHorizontal: 12
  },
  videoModalCard: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0B0D10',
    borderWidth: 1,
    borderColor: '#1F242D'
  },
  videoModalHeader: {
    minHeight: 44,
    backgroundColor: '#14181F',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  videoModalTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14
  },
  videoModalClose: {
    color: colors.primary,
    fontWeight: '800'
  },
  videoWebview: {
    width: '100%',
    height: 260,
    backgroundColor: '#000000'
  }
});
