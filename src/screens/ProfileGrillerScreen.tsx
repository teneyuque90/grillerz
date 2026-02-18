import { useState } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../ui/components/AppButton';
import { AppCard } from '../ui/components/AppCard';
import { AppChip } from '../ui/components/AppChip';
import { AppScreen } from '../ui/components/AppScreen';
import { AppText } from '../ui/components/AppText';
import { SectionHeader } from '../ui/components/SectionHeader';
import { colors, radius, shadows, spacing } from '../ui/theme';
import { getLocalAvatarUriByChef, getLocalCoverUriByChef, getLocalDishUriByName, getLocalVideoThumbUri } from '../data/localMedia';

const hero = {
  name: 'Erick Martinez',
  badge: 'Griller Master',
  city: 'Nuevo Laredo',
  rating: 4.9,
  reviews: 126,
  bannerUrl: getLocalCoverUriByChef('erick-martinez'),
  avatarUrl: getLocalAvatarUriByChef('erick-martinez')
};

const stats = [
  { label: 'Servicios', value: '85' },
  { label: 'Clientes', value: '240' },
  { label: 'Años', value: '5' }
];

const specialties = ['Costillas a la Parrilla', 'Tomahawk al Carbón', 'Parrilla Mixta'];

const menuItems = [
  { id: 'm1', label: 'Corte #1', imageUrl: getLocalDishUriByName('corte-1') },
  { id: 'm2', label: 'Corte #2', imageUrl: getLocalDishUriByName('corte-2') },
  { id: 'm3', label: 'Corte #3', imageUrl: getLocalDishUriByName('corte-3') },
  { id: 'm4', label: 'Corte #4', imageUrl: getLocalDishUriByName('corte-4') }
];

const videos = [
  { id: 'v1', title: 'Ribeye jugoso al punto', thumbUrl: getLocalVideoThumbUri('v1') },
  { id: 'v2', title: 'Tomahawk al carbón', thumbUrl: getLocalVideoThumbUri('v2') },
  { id: 'v3', title: 'Parrilla mixta para evento', thumbUrl: getLocalVideoThumbUri('v3') }
];

const reviews = [
  {
    id: 'r1',
    author: 'Carlos M.',
    date: '12 Abr 2026',
    rating: 5,
    comment: 'Excelente servicio, puntual y todo el menú quedó espectacular.'
  },
  {
    id: 'r2',
    author: 'Paola R.',
    date: '08 Abr 2026',
    rating: 4,
    comment: 'Muy buen sabor y presentación. Repetiríamos sin duda.'
  },
  {
    id: 'r3',
    author: 'Jorge T.',
    date: '30 Mar 2026',
    rating: 5,
    comment: 'Gran experiencia para la familia. Profesional y muy limpio.'
  }
];

function FireRating({ value }: { value: number }) {
  return (
    <View style={styles.fireRow}>
      {Array.from({ length: 5 }).map((_, index) => (
        <AppText key={`fire-${value}-${index}`} variant="caption" style={index < value ? styles.fireOn : styles.fireOff}>
          🔥
        </AppText>
      ))}
    </View>
  );
}

export function ProfileGrillerScreen() {
  const insets = useSafeAreaInsets();
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(specialties);

  function toggleSpecialty(item: string) {
    setSelectedSpecialties((prev) => {
      if (prev.includes(item)) {
        return prev.filter((entry) => entry !== item);
      }
      return [...prev, item];
    });
  }

  return (
    <View style={styles.root}>
      <AppScreen scroll contentStyle={styles.content}>
        <View style={styles.heroWrap}>
          <ImageBackground source={{ uri: hero.bannerUrl }} style={styles.heroBanner} imageStyle={styles.heroBannerImage}>
            <View style={styles.heroOverlay} />
            <View style={styles.heroDetails}>
              <Image source={{ uri: hero.avatarUrl }} style={styles.avatar} />
              <View style={styles.heroMeta}>
                <AppText variant="h2" style={styles.heroName}>{hero.name}</AppText>
                <View style={styles.heroBadgeRow}>
                  <AppChip label={hero.badge} selected />
                  <AppText variant="caption" style={styles.heroCity}>{hero.city}</AppText>
                </View>
                <View style={styles.heroRatingRow}>
                  <AppText variant="body" style={styles.fireIcon}>🔥</AppText>
                  <AppText variant="body" style={styles.heroRatingValue}>{hero.rating.toFixed(1)}</AppText>
                  <AppText variant="caption" style={styles.heroReviews}>({hero.reviews} reseñas)</AppText>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.statsRow}>
          {stats.map((item) => (
            <AppCard key={item.label} style={styles.statCard}>
              <AppText variant="h2" style={styles.statValue}>{item.value}</AppText>
              <AppText variant="caption">{item.label}</AppText>
            </AppCard>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Especializaciones" />
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
          <SectionHeader title="Sobre el griller" />
          <AppCard>
            <AppText variant="body" style={styles.bioText}>
              Especialista en eventos familiares y corporativos. Maneja cortes premium, servicio puntual y
              cocina en vivo con presentación profesional para experiencias memorables.
            </AppText>
          </AppCard>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Menú visual" />
          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <AppCard key={item.id} style={styles.menuCard} contentStyle={styles.menuCardContent}>
                <Image source={{ uri: item.imageUrl }} style={styles.menuImage} />
                <AppText variant="caption" style={styles.menuLabel}>{item.label}</AppText>
              </AppCard>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Videos YouTube" actionText="Ver todos" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.videosRow}>
            {videos.map((video) => (
              <AppCard key={video.id} style={styles.videoCard} contentStyle={styles.videoCardContent}>
                <ImageBackground source={{ uri: video.thumbUrl }} style={styles.videoThumb} imageStyle={styles.videoThumbImage}>
                  <Pressable style={styles.playButton}>
                    <AppText variant="body" style={styles.playIcon}>▶</AppText>
                  </Pressable>
                </ImageBackground>
                <AppText variant="body" style={styles.videoTitle}>{video.title}</AppText>
              </AppCard>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Reseñas" actionText="Ver más" />
          <View style={styles.reviewList}>
            {reviews.map((item) => (
              <AppCard key={item.id}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewIdentity}>
                    <View style={styles.reviewAvatar}>
                      <AppText variant="caption" style={styles.reviewInitial}>
                        {item.author.charAt(0)}
                      </AppText>
                    </View>
                    <View style={styles.reviewMeta}>
                      <AppText variant="body" style={styles.reviewAuthor}>{item.author}</AppText>
                      <AppText variant="caption">{item.date}</AppText>
                    </View>
                  </View>
                  <FireRating value={item.rating} />
                </View>
                <AppText variant="body" style={styles.reviewComment}>{item.comment}</AppText>
              </AppCard>
            ))}
          </View>
        </View>
      </AppScreen>

      <View style={[styles.stickyCta, { paddingBottom: Math.max(insets.bottom, spacing.s12) }]}>
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
    paddingBottom: 120,
    gap: spacing.s24
  },
  heroWrap: {
    borderRadius: radius.r16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card
  },
  heroBanner: {
    height: 250,
    justifyContent: 'flex-end'
  },
  heroBannerImage: {
    borderRadius: radius.r16
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    backgroundColor: 'rgba(17, 24, 39, 0.58)'
  },
  heroDetails: {
    padding: spacing.s16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.s12
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 86,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#F5F5F5',
    marginBottom: -18
  },
  heroMeta: {
    flex: 1,
    gap: spacing.s8
  },
  heroName: {
    color: '#FFFFFF'
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8
  },
  heroCity: {
    color: '#F3F4F6'
  },
  heroRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s4
  },
  fireIcon: {
    color: colors.primary
  },
  heroRatingValue: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  heroReviews: {
    color: '#E5E7EB'
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.s12
  },
  statCard: {
    flex: 1
  },
  statValue: {
    color: colors.text
  },
  section: {
    gap: spacing.s16
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s8
  },
  bioText: {
    color: colors.muted
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.s12
  },
  menuCard: {
    width: '48.5%'
  },
  menuCardContent: {
    padding: spacing.s8,
    gap: spacing.s8
  },
  menuImage: {
    width: '100%',
    height: 110,
    borderRadius: radius.r12,
    backgroundColor: '#F4F4F5'
  },
  menuLabel: {
    color: colors.text
  },
  videosRow: {
    gap: spacing.s12,
    paddingRight: spacing.s16
  },
  videoCard: {
    width: 240
  },
  videoCardContent: {
    gap: spacing.s8
  },
  videoThumb: {
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.r12,
    overflow: 'hidden'
  },
  videoThumbImage: {
    borderRadius: radius.r12
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    ...shadows.card
  },
  playIcon: {
    color: '#FFFFFF',
    marginLeft: 1
  },
  videoTitle: {
    color: colors.text,
    fontWeight: '600'
  },
  reviewList: {
    gap: spacing.s12
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s8,
    gap: spacing.s12
  },
  reviewIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s8,
    flex: 1
  },
  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chipBg
  },
  reviewInitial: {
    color: colors.primary,
    fontWeight: '600'
  },
  reviewMeta: {
    flex: 1
  },
  reviewAuthor: {
    color: colors.text,
    fontWeight: '600'
  },
  fireRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1
  },
  fireOn: {
    color: colors.primary
  },
  fireOff: {
    color: '#FECACA'
  },
  reviewComment: {
    color: colors.muted
  },
  stickyCta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#FFFFFF',
    paddingTop: spacing.s12,
    paddingHorizontal: spacing.s16,
    ...shadows.sticky
  }
});

export default ProfileGrillerScreen;
