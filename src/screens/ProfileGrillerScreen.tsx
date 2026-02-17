import { useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { AppSpacing } from '../theme/grillerzTheme';
import { AppButton } from '../ui/components/AppButton';
import { AppCard } from '../ui/components/AppCard';
import { AppChip } from '../ui/components/AppChip';
import { AppScreen } from '../ui/components/AppScreen';
import { AppText } from '../ui/components/AppText';

const hero = {
  name: 'Erick Martinez',
  badge: 'Griller Master',
  city: 'Nuevo Laredo',
  rating: 4.9,
  reviews: 126,
  bannerUrl: 'https://picsum.photos/1280/720?random=421',
  avatarUrl: 'https://i.pravatar.cc/300?img=11'
};

const stats = [
  { label: 'Servicios', value: '85' },
  { label: 'Clientes', value: '240' },
  { label: 'Años', value: '5' }
];

const specialties = ['Costillas', 'Tomahawk', 'Parrilla Mixta'];

const visualMenu = [
  { id: '1', label: 'Corte #1', imageUrl: 'https://picsum.photos/500/360?random=31' },
  { id: '2', label: 'Corte #2', imageUrl: 'https://picsum.photos/500/360?random=32' },
  { id: '3', label: 'Corte #3', imageUrl: 'https://picsum.photos/500/360?random=33' },
  { id: '4', label: 'Corte #4', imageUrl: 'https://picsum.photos/500/360?random=34' }
];

const youtubeVideos = [
  { id: 'v1', title: 'Sellado perfecto en ribeye', thumbUrl: 'https://picsum.photos/640/360?random=81' },
  { id: 'v2', title: 'Tomahawk a fuego vivo', thumbUrl: 'https://picsum.photos/640/360?random=82' },
  { id: 'v3', title: 'Parrilla mixta para evento', thumbUrl: 'https://picsum.photos/640/360?random=83' }
];

const reviews = [
  { id: 'r1', author: 'Carlos M.', date: 'Hace 2 días', rating: 5, comment: 'Gran servicio, puntual y excelente sabor en los cortes.' },
  { id: 'r2', author: 'Paola R.', date: 'Hace 1 semana', rating: 4, comment: 'Muy buena experiencia, presentación impecable.' },
  { id: 'r3', author: 'Juan T.', date: 'Hace 3 semanas', rating: 5, comment: 'Nos encantó. Definitivamente lo volveremos a contratar.' }
];

export function ProfileGrillerScreen() {
  const insets = useSafeAreaInsets();
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Costillas', 'Parrilla Mixta']);

  function toggleSpecialty(name: string) {
    setSelectedSpecialties((prev) => {
      if (prev.includes(name)) {
        return prev.filter((item) => item !== name);
      }

      return [...prev, name];
    });
  }

  return (
    <View style={styles.root}>
      <AppScreen scroll contentStyle={styles.content}>
        <AppCard style={styles.heroCard} contentStyle={styles.heroCardContent}>
          <ImageBackground source={{ uri: hero.bannerUrl }} style={styles.heroBanner} imageStyle={styles.heroBannerImage}>
            <LinearGradient
              colors={['rgba(9, 9, 11, 0.05)', 'rgba(9, 9, 11, 0.75)']}
              start={{ x: 0.5, y: 0.2 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.heroOverlay}
            />
            <View style={styles.heroInfo}>
              <Image source={{ uri: hero.avatarUrl }} style={styles.avatar} />
              <View style={styles.heroMeta}>
                <AppText variant="h2" style={styles.heroName}>{hero.name}</AppText>
                <View style={styles.badgesRow}>
                  <AppChip label={hero.badge} selected />
                  <AppText variant="caption" style={styles.cityText}>{hero.city}</AppText>
                </View>
                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons name="fire" size={16} color={colors.primary} />
                  <AppText variant="body" style={styles.heroRating}>{hero.rating.toFixed(1)}</AppText>
                  <AppText variant="caption" style={styles.heroReviews}>({hero.reviews} reseñas)</AppText>
                </View>
              </View>
            </View>
          </ImageBackground>
        </AppCard>

        <View style={styles.statsRow}>
          {stats.map((item) => (
            <AppCard key={item.label} style={styles.statCard}>
              <AppText variant="h2" style={styles.statValue}>{item.value}</AppText>
              <AppText variant="caption">{item.label}</AppText>
            </AppCard>
          ))}
        </View>

        <View style={styles.section}>
          <AppText variant="section">Especializaciones</AppText>
          <View style={styles.chipsWrap}>
            {specialties.map((item) => (
              <AppChip
                key={item}
                label={item}
                selected={selectedSpecialties.includes(item)}
                onPress={() => toggleSpecialty(item)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="section">Sobre el griller</AppText>
          <AppCard>
            <AppText variant="body" style={styles.bodyText}>
              Especialista en eventos sociales y corporativos, enfocado en cortes premium, puntualidad
              y presentación profesional con parrilla en vivo.
            </AppText>
          </AppCard>
        </View>

        <View style={styles.section}>
          <AppText variant="section">Menú visual</AppText>
          <View style={styles.grid}>
            {visualMenu.map((item) => (
              <AppCard key={item.id} style={styles.gridCard} contentStyle={styles.gridCardContent}>
                <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
                <AppText variant="caption" style={styles.gridLabel}>{item.label}</AppText>
              </AppCard>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="section">Videos YouTube</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.videoRow}>
            {youtubeVideos.map((video) => (
              <AppCard key={video.id} style={styles.videoCard} contentStyle={styles.videoContent}>
                <ImageBackground source={{ uri: video.thumbUrl }} style={styles.videoThumb} imageStyle={styles.videoThumbImage}>
                  <Pressable style={styles.playButton}>
                    <MaterialCommunityIcons name="play" size={18} color="#FFFFFF" />
                  </Pressable>
                </ImageBackground>
                <AppText variant="body" style={styles.videoTitle}>{video.title}</AppText>
              </AppCard>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <AppText variant="section">Reseñas</AppText>
          <View style={styles.reviewList}>
            {reviews.map((item) => (
              <AppCard key={item.id}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewIdentity}>
                    <View style={styles.reviewAvatar}>
                      <AppText variant="caption" style={styles.reviewInitial}>{item.author.charAt(0)}</AppText>
                    </View>
                    <View>
                      <AppText variant="body" style={styles.reviewAuthor}>{item.author}</AppText>
                      <AppText variant="caption">{item.date}</AppText>
                    </View>
                  </View>
                  <View style={styles.reviewRating}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <MaterialCommunityIcons
                        key={`${item.id}-fire-${index}`}
                        name="fire"
                        size={14}
                        color={index < item.rating ? colors.primary : '#FBD5CF'}
                      />
                    ))}
                  </View>
                </View>
                <AppText variant="body" style={styles.reviewComment}>{item.comment}</AppText>
              </AppCard>
            ))}
          </View>
        </View>
      </AppScreen>

      <View style={[styles.stickyCta, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppButton label="Reservar ahora" variant="primary" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingTop: AppSpacing.s16,
    paddingBottom: 120,
    gap: AppSpacing.s24
  },
  heroCard: {
    overflow: 'hidden'
  },
  heroCardContent: {
    padding: 0
  },
  heroBanner: {
    minHeight: 280,
    justifyContent: 'flex-end'
  },
  heroBannerImage: {
    borderRadius: 16
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject
  },
  heroInfo: {
    padding: AppSpacing.s16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: AppSpacing.s16
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 84,
    borderWidth: 3,
    borderColor: '#FFFFFF'
  },
  heroMeta: {
    flex: 1,
    gap: 6
  },
  heroName: {
    color: '#FFFFFF'
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  cityText: {
    color: '#FEE4E2'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  heroRating: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  heroReviews: {
    color: '#FECACA'
  },
  statsRow: {
    flexDirection: 'row',
    gap: AppSpacing.s16
  },
  statCard: {
    flex: 1
  },
  statValue: {
    color: colors.textStrong
  },
  section: {
    gap: AppSpacing.s16
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.s8
  },
  bodyText: {
    color: colors.textMuted
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.s16
  },
  gridCard: {
    width: '47%'
  },
  gridCardContent: {
    padding: 8,
    gap: 8
  },
  gridImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.backgroundMuted
  },
  gridLabel: {
    color: colors.textStrong
  },
  videoRow: {
    gap: AppSpacing.s16,
    paddingRight: AppSpacing.s16
  },
  videoCard: {
    width: 230
  },
  videoContent: {
    gap: 10
  },
  videoThumb: {
    height: 128,
    justifyContent: 'center',
    alignItems: 'center'
  },
  videoThumbImage: {
    borderRadius: 12
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 38,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center'
  },
  videoTitle: {
    color: colors.textStrong,
    fontWeight: '700'
  },
  reviewList: {
    gap: AppSpacing.s16
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  reviewIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 34,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  reviewInitial: {
    color: colors.primaryDark,
    fontWeight: '800'
  },
  reviewAuthor: {
    color: colors.textStrong,
    fontWeight: '800'
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  reviewComment: {
    color: colors.textMuted
  },
  stickyCta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderColor: '#F2F4F7',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingTop: 12,
    paddingHorizontal: AppSpacing.s16
  }
});

export default ProfileGrillerScreen;
