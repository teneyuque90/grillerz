import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../theme/colors';

type OnboardingArtProps = {
  variant: 1 | 2 | 3;
};

export function OnboardingArt({ variant }: OnboardingArtProps) {
  if (variant === 1) {
    return (
      <LinearGradient colors={['#FFF4F2', '#FFDCD5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.base}>
        <View style={styles.cardLarge}>
          <Text style={styles.cardTitle}>Grillers Verificados</Text>
          <Text style={styles.cardBody}>Encuentra especialistas para eventos en casa.</Text>
        </View>
        <View style={styles.chipRow}>
          <View style={styles.chip}><Text style={styles.chipText}>Costillas</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>Tomahawk</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>Regio</Text></View>
        </View>
      </LinearGradient>
    );
  }

  if (variant === 2) {
    return (
      <LinearGradient colors={['#FFF9F0', '#FFE8C2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.base}>
        <View style={styles.mockPhone}>
          <View style={styles.mockHeader} />
          <View style={styles.mockRow}><View style={styles.mockThumb} /><View style={styles.mockLineBlock} /></View>
          <View style={styles.mockRow}><View style={styles.mockThumb} /><View style={styles.mockLineBlock} /></View>
          <View style={styles.mockRow}><View style={styles.mockThumb} /><View style={styles.mockLineBlock} /></View>
        </View>
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Reserva desde</Text>
          <Text style={styles.priceValue}>$2,800 MXN</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFF4F2', '#FFE5E2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.base}>
      <View style={styles.mapBox}>
        <View style={styles.mapPath} />
        <View style={[styles.pin, styles.pinMain]} />
        <View style={[styles.pin, styles.pinAlt]} />
        <View style={[styles.pin, styles.pinThird]} />
      </View>
      <View style={styles.locationCard}>
        <Text style={styles.locationTitle}>Cerca de tu ubicacion</Text>
        <Text style={styles.locationBody}>Mostraremos solo grillers disponibles en tu zona.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    borderRadius: 28,
    padding: 18,
    justifyContent: 'space-between'
  },
  cardLarge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    gap: 6
  },
  cardTitle: {
    color: colors.textStrong,
    fontSize: 20,
    fontWeight: '900'
  },
  cardBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  chip: {
    paddingHorizontal: 12,
    minHeight: 34,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0D7D2',
    justifyContent: 'center'
  },
  chipText: {
    color: colors.primaryDark,
    fontWeight: '700'
  },
  mockPhone: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 14,
    gap: 12
  },
  mockHeader: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F2F4F7'
  },
  mockRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  },
  mockThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#FEE4E2'
  },
  mockLineBlock: {
    height: 46,
    borderRadius: 10,
    flex: 1,
    backgroundColor: '#F2F4F7'
  },
  priceBox: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF'
  },
  priceLabel: {
    color: colors.textMuted,
    fontWeight: '600'
  },
  priceValue: {
    marginTop: 4,
    color: colors.primaryDark,
    fontSize: 24,
    fontWeight: '900'
  },
  mapBox: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  mapPath: {
    position: 'absolute',
    top: 30,
    left: 25,
    right: 25,
    bottom: 30,
    borderWidth: 2,
    borderColor: '#FEE4E2',
    borderRadius: 999
  },
  pin: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 18,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: '#FFD6D2'
  },
  pinMain: {
    top: 44,
    left: 120
  },
  pinAlt: {
    top: 150,
    left: 70
  },
  pinThird: {
    top: 110,
    right: 65
  },
  locationCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
    gap: 6
  },
  locationTitle: {
    color: colors.textStrong,
    fontWeight: '800',
    fontSize: 17
  },
  locationBody: {
    color: colors.textMuted,
    lineHeight: 20
  }
});
