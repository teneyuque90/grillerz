import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../navigation/screenConfig';
import { BottomNav } from '../../components/ui/BottomNav';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Browse03'>;

const reels = [
  { title: 'Tomahawk al Carbon', chefId: 'martin-asador' },
  { title: 'Costillas Ahumadas', chefId: 'erick-martinez' },
  { title: 'Parrilla Mixta', chefId: 'carlos-bbq' }
];

export function Browse03({ navigation }: Props) {
  const { chefs, selectChef } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>descubre grillers</Text>
            <Pressable onPress={() => navigation.navigate('Browse02')}>
              <Text style={styles.link}>Lista</Text>
            </Pressable>
          </View>

          <View style={styles.feed}>
            {reels.map((reel, index) => {
              const chef = chefs.find((item) => item.id === reel.chefId);

              return (
                <Pressable
                  key={`${reel.chefId}-${reel.title}`}
                  style={styles.reelCard}
                  onPress={() => {
                    selectChef(reel.chefId);
                    navigation.navigate('Profile');
                  }}
                >
                  {chef?.coverUrl ? (
                    <ImageBackground source={{ uri: chef.coverUrl }} style={StyleSheet.absoluteFill}>
                      <View style={styles.reelShade} />
                    </ImageBackground>
                  ) : (
                    <LinearGradient
                      colors={index === 0 ? ['#1E120D', '#FF4D2D'] : ['#2A1B16', '#B93823']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <View style={styles.reelOverlay}>
                    <Text style={styles.reelTitle}>{reel.title}</Text>
                    <Text style={styles.reelMeta}>
                      {chef?.city ?? 'Nuevo Laredo'}  -  Rating {chef?.rating ?? 4.8}
                    </Text>
                    <Pressable
                      style={styles.reelButton}
                      onPress={() => {
                        selectChef(reel.chefId);
                        navigation.navigate('Schedule');
                      }}
                    >
                      <Text style={styles.reelButtonLabel}>Reservar</Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <BottomNav activeTab="Browse01" onNavigate={(route) => navigation.navigate(route)} />
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
  scrollContent: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 120
  },
  headerRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    color: colors.textStrong,
    fontSize: 33,
    lineHeight: 37,
    fontWeight: '900',
    maxWidth: 280
  },
  link: {
    color: colors.primary,
    fontWeight: '800'
  },
  feed: {
    marginTop: 18,
    gap: 14
  },
  reelCard: {
    minHeight: 250,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end'
  },
  reelOverlay: {
    padding: 16,
    backgroundColor: 'rgba(15, 10, 8, 0.22)',
    gap: 6
  },
  reelShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 8, 0.38)'
  },
  reelTitle: {
    color: '#FFFFFF',
    fontSize: 29,
    lineHeight: 32,
    fontWeight: '900'
  },
  reelMeta: {
    color: '#FFD9D3',
    fontWeight: '600'
  },
  reelButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    minHeight: 36,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center'
  },
  reelButtonLabel: {
    color: colors.primaryDark,
    fontWeight: '800'
  }
});
