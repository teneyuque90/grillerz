import { Image, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomNav } from '../../components/ui/BottomNav';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function Profile({ navigation }: Props) {
  const { selectedChef } = useAppState();

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
              {selectedChef.coverUrl ? (
                <ImageBackground source={{ uri: selectedChef.coverUrl }} style={styles.heroMedia} imageStyle={styles.heroMediaImage}>
                  <View style={styles.heroShade} />
                </ImageBackground>
              ) : (
                <LinearGradient colors={[colors.flameEnd, colors.flameStart]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroMedia} />
              )}

              {selectedChef.avatarUrl ? (
                <Image source={{ uri: selectedChef.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar} />
              )}
              <View style={styles.heroCopy}>
                <Text style={styles.heroName}>{selectedChef.name}</Text>
                <Text style={styles.heroMeta}>{selectedChef.title}  -  {selectedChef.city}</Text>
                <Text style={styles.heroRating}>Rating {selectedChef.rating}  ({selectedChef.reviews} resenas)</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{selectedChef.stats.services}</Text>
                <Text style={styles.statLabel}>Servicios</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{selectedChef.stats.clients}</Text>
                <Text style={styles.statLabel}>Clientes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{selectedChef.stats.years}</Text>
                <Text style={styles.statLabel}>Anos</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Especializaciones</Text>
              <View style={styles.tagsWrap}>
                {selectedChef.specialties.map((item) => (
                  <View key={item} style={styles.tag}>
                    <Text style={styles.tagText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sobre el griller</Text>
              <Text style={styles.bio}>{selectedChef.bio}</Text>
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
  heroRating: {
    marginTop: 4,
    color: '#FFD9D3',
    fontWeight: '600'
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8
  },
  statCard: {
    flex: 1,
    minHeight: 74,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
  tag: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: colors.backgroundMuted
  },
  tagText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13
  },
  bio: {
    color: colors.textMuted,
    lineHeight: 22,
    fontSize: 15
  }
});
