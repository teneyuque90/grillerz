import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../navigation/screenConfig';
import { BottomNav } from '../../components/ui/BottomNav';
import { ReliableImage } from '../../components/ui/ReliableImage';
import { ReliableImageBackground } from '../../components/ui/ReliableImageBackground';
import { getDishImageByName } from '../../data/mediaLibrary';
import { getLocalCoverUriByChef, getLocalDishUriByName } from '../../data/localMedia';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { AppSpacing } from '../../theme/grillerzTheme';
import { AppButton } from '../../ui/components/AppButton';
import { AppCard } from '../../ui/components/AppCard';
import { AppChip } from '../../ui/components/AppChip';
import { AppScreen } from '../../ui/components/AppScreen';
import { AppText } from '../../ui/components/AppText';
import { SectionHeader } from '../../ui/components/SectionHeader';
import { getChefCoverUrl } from '../../utils/chefMedia';

type Props = NativeStackScreenProps<RootStackParamList, 'Browse01'>;

const featured = [
  { dishName: 'Costillas a la Parrilla', chefId: 'cories-bbq', price: '$2,800' },
  { dishName: 'Asado Regio', chefId: 'luis-bbq', price: '$3,200' },
  { dishName: 'Costillas Ahumadas', chefId: 'martin-asador', price: '$3,600' }
];
const categories = ['Top', 'Costillas', 'Tomahawk', 'Parrilla', 'Ahumados'];

export function Browse01({ navigation }: Props) {
  const { chefs, selectChef } = useAppState();
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const heroItem = featured[0];
  const heroChef = chefs.find((chef) => chef.id === heroItem.chefId);
  const heroCoverUrl = getChefCoverUrl(heroChef);
  const heroFallbackUrl = getLocalCoverUriByChef(heroChef?.id ?? heroItem.chefId);
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
          <AppText variant="title" style={styles.title}>populares en tu zona</AppText>
          <Pressable onPress={() => navigation.navigate('Search')}>
            <AppText variant="body" style={styles.search}>Buscar</AppText>
          </Pressable>
        </View>

        <View style={styles.categoriesRow}>
          {categories.map((item) => (
            <AppChip
              key={item}
              label={item}
              selected={item === activeCategory}
              onPress={() => setActiveCategory(item)}
            />
          ))}
        </View>

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
            selectChef(featured[0].chefId);
            navigation.navigate('Schedule');
          }}
        />
      </AppScreen>

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
    paddingTop: 24,
    paddingBottom: 120
  },
  headerRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: AppSpacing.s16
  },
  title: {
    maxWidth: 250,
    fontSize: 30,
    lineHeight: 34
  },
  search: {
    color: colors.primary,
    fontWeight: '800'
  },
  categoriesRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.s8
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
  }
});
