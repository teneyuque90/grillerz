import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../navigation/screenConfig';
import { BottomNav } from '../../components/ui/BottomNav';
import { ReliableImage } from '../../components/ui/ReliableImage';
import { ReliableImageBackground } from '../../components/ui/ReliableImageBackground';
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
