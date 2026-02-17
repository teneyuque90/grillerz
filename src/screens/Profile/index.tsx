import { useEffect, useState } from 'react';
import { Image, ImageBackground, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { grillerzApi } from '../../api/grillerzApi';
import { AppCard } from '../../components/ui/AppCard';
import { AppChip } from '../../components/ui/AppChip';
import { OFFLINE_DEMO_MODE } from '../../config/api';
import { getGrillerVideos, getYouTubeThumbnail } from '../../data/mediaLibrary';
import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomNav } from '../../components/ui/BottomNav';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { ChefReview, ChefVideo } from '../../types/domain';
import { resolveMediaUrl } from '../../utils/media';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

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
  const { selectedChef } = useAppState();
  const coverUrl = resolveMediaUrl(selectedChef.coverUrl);
  const avatarUrl = resolveMediaUrl(selectedChef.avatarUrl);
  const galleryImages = selectedChef.gallery.map((item) => resolveMediaUrl(item)).filter(Boolean);
  const [grillerVideos, setGrillerVideos] = useState<ChefVideo[]>(getGrillerVideos(selectedChef.id));
  const [reviews, setReviews] = useState<ChefReview[]>(fallbackReviewsByChefId[selectedChef.id] ?? []);

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
              {coverUrl ? (
                <ImageBackground source={{ uri: coverUrl }} style={styles.heroMedia} imageStyle={styles.heroMediaImage}>
                  <View style={styles.heroShade} />
                </ImageBackground>
              ) : (
                <LinearGradient colors={[colors.flameEnd, colors.flameStart]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroMedia} />
              )}

              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar} />
              )}
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
                  <ImageBackground key={`${selectedChef.id}-gallery-${index}`} source={{ uri: imageUrl }} style={styles.galleryCard} imageStyle={styles.galleryCardImage}>
                    <View style={styles.galleryShade}>
                      <Text style={styles.galleryLabel}>Corte #{index + 1}</Text>
                    </View>
                  </ImageBackground>
                ))}
                {galleryImages.length === 0 ? <Text style={styles.emptyReviews}>No hay imagenes disponibles.</Text> : null}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Videos del griller (YouTube)</Text>
              <View style={styles.videosList}>
                {grillerVideos.map((video) => (
                  <AppCard key={video.id} padded={false} style={styles.videoCard} onPress={() => Linking.openURL(video.youtubeUrl)}>
                    <ImageBackground source={{ uri: getYouTubeThumbnail(video.videoId) }} style={styles.videoThumb} imageStyle={styles.videoThumbImage}>
                      <View style={styles.videoPlayBadge}>
                        <MaterialCommunityIcons name="play" size={16} color="#FFFFFF" />
                      </View>
                    </ImageBackground>
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

        <BottomNav activeTab="Profile" onNavigate={(route) => navigation.navigate(route)} />
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
  }
});
