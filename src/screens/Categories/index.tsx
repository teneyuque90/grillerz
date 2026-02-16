import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomNav } from '../../components/ui/BottomNav';
import { getCategoryImageByName } from '../../data/mediaLibrary';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

const categories = [
  'Asado Regio',
  'Costillas',
  'Tomahawk',
  'Brisket',
  'Parrilla Mixta',
  'Mariscos',
  'Veggie Grill',
  'Paquete Familiar',
  'Evento Premium'
];

export function Categories({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader title="Categorias" onBack={() => navigation.goBack()} />

          <Text style={styles.subtitle}>Selecciona uno o varios estilos para personalizar tus resultados.</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
            {categories.map((category, index) => (
              <Pressable
                key={category}
                style={[styles.card, index < 2 || index === 4 ? styles.cardActive : null]}
                onPress={() => navigation.navigate('Browse02')}
              >
                <ImageBackground source={{ uri: getCategoryImageByName(category) }} style={styles.thumb} imageStyle={styles.thumbImage}>
                  <View style={styles.thumbShade} />
                </ImageBackground>
                <Text style={[styles.cardLabel, index < 2 || index === 4 ? styles.cardLabelActive : null]}>{category}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120
  },
  subtitle: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 330
  },
  grid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 12
  },
  card: {
    width: '48.5%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    gap: 8,
    backgroundColor: colors.background
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundMuted
  },
  thumb: {
    height: 74,
    borderRadius: 10,
    overflow: 'hidden'
  },
  thumbImage: {
    borderRadius: 10
  },
  thumbShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 8, 0.22)'
  },
  cardLabel: {
    color: colors.textStrong,
    fontWeight: '700',
    fontSize: 14
  },
  cardLabelActive: {
    color: colors.primaryDark
  }
});
