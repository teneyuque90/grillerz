import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomNav } from '../../components/ui/BottomNav';
import { ReliableImage } from '../../components/ui/ReliableImage';
import { ReliableImageBackground } from '../../components/ui/ReliableImageBackground';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { getLocalAvatarUriByChef, getLocalCoverUriByChef } from '../../data/localMedia';
import { getChefAvatarUrl, getChefCoverUrl } from '../../utils/chefMedia';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

const favorites = [
  { chefId: 'erick-martinez', specialty: 'Costillas / Tomahawk', price: '$2,800' },
  { chefId: 'carlos-bbq', specialty: 'Parrilla Mixta', price: '$3,200' },
  { chefId: 'martin-asador', specialty: 'Brisket / Costillas', price: '$3,600' }
];

export function Favorites({ navigation }: Props) {
  const { chefs, selectChef } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader
            title="Favoritos"
            onBack={() => navigation.goBack()}
            rightAction="Buscar"
            onRightAction={() => navigation.navigate('Search')}
          />

          <View style={styles.chipsRow}>
            <Pressable style={[styles.chip, styles.chipActive]}>
              <Text style={[styles.chipText, styles.chipTextActive]}>Todos</Text>
            </Pressable>
            <Pressable style={styles.chip}>
              <Text style={styles.chipText}>Top rated</Text>
            </Pressable>
            <Pressable style={styles.chip}>
              <Text style={styles.chipText}>Cerca de mi</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {favorites.map((item) => {
              const chef = chefs.find((candidate) => candidate.id === item.chefId);
              const avatarUrl = getChefAvatarUrl(chef);
              const coverUrl = getChefCoverUrl(chef);
              const avatarFallbackUrl = getLocalAvatarUriByChef(chef?.id ?? item.chefId);
              const coverFallbackUrl = getLocalCoverUriByChef(chef?.id ?? item.chefId);

              return (
                <View key={item.chefId} style={styles.card}>
                  <ReliableImageBackground uri={coverUrl} fallbackUri={coverFallbackUrl} style={styles.cover} imageStyle={styles.coverImage}>
                    <View style={styles.coverShade} />
                  </ReliableImageBackground>
                  <View style={styles.topRow}>
                    <ReliableImage uri={avatarUrl} fallbackUri={avatarFallbackUrl} style={styles.avatar} />
                    <View style={styles.headline}>
                      <Text style={styles.name}>{chef?.name ?? 'Griller'}</Text>
                      <Text style={styles.subline}>{item.specialty}</Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.meta}>{chef?.city ?? 'Nuevo Laredo'}</Text>
                        <View style={styles.ratingChip}>
                          <MaterialCommunityIcons name="fire" size={12} color={colors.primary} />
                          <Text style={styles.ratingText}>{chef?.rating ?? 4.8}</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.heart}>Fav</Text>
                  </View>

                  <View style={styles.bottomRow}>
                    <Text style={styles.price}>{item.price} MXN</Text>
                    <View style={styles.actionsRow}>
                      <Pressable
                        style={styles.secondaryBtn}
                        onPress={() => {
                          selectChef(item.chefId);
                          navigation.navigate('Profile');
                        }}
                      >
                        <Text style={styles.secondaryLabel}>Perfil</Text>
                      </Pressable>
                      <Pressable
                        style={styles.primaryBtn}
                        onPress={() => {
                          selectChef(item.chefId);
                          navigation.navigate('Schedule');
                        }}
                      >
                        <Text style={styles.primaryLabel}>Reservar</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <BottomNav activeTab="Favorites" onNavigate={(route) => navigation.navigate(route)} />
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
  chipsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8
  },
  chip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  chipText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 12
  },
  chipTextActive: {
    color: colors.primaryDark
  },
  list: {
    marginTop: 14,
    gap: 12,
    paddingBottom: 12
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    gap: 10
  },
  cover: {
    height: 74,
    borderRadius: 12,
    overflow: 'hidden'
  },
  coverImage: {
    borderRadius: 12
  },
  coverShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 8, 0.22)'
  },
  topRow: {
    marginTop: -16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 56,
    backgroundColor: '#FFE5E2',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  headline: {
    flex: 1,
    gap: 2
  },
  name: {
    color: colors.textStrong,
    fontSize: 17,
    fontWeight: '900'
  },
  subline: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600'
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FFD4CC',
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 7,
    paddingVertical: 2
  },
  ratingText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800'
  },
  heart: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  price: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '900'
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8
  },
  secondaryBtn: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  secondaryLabel: {
    color: colors.textStrong,
    fontWeight: '700',
    fontSize: 12
  },
  primaryBtn: {
    minHeight: 34,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12
  }
});
