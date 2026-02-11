import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Success'>;

export function Success({ navigation }: Props) {
  const { selectedBooking } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>OK</Text>
        </View>

        <Text style={styles.title}>Reserva confirmada</Text>
        <Text style={styles.subtitle}>Tu parrillero recibio la solicitud. Te notificaremos cualquier actualizacion.</Text>

        <View style={styles.detailsCard}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Codigo</Text>
            <Text style={styles.rowValue}>#{selectedBooking?.id ?? 'GRZ-0000'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Fecha</Text>
            <Text style={styles.rowValue}>{selectedBooking?.dateLabel ?? '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Hora</Text>
            <Text style={styles.rowValue}>{selectedBooking?.timeLabel ?? '-'}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Ver reservas" onPress={() => navigation.navigate('Bookings')} />
          <Pressable style={styles.secondary} onPress={() => navigation.navigate('Browse01')}>
            <Text style={styles.secondaryLabel}>Volver al inicio</Text>
          </Pressable>
        </View>
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
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: 'center'
  },
  iconWrap: {
    width: 86,
    height: 86,
    borderRadius: 86,
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#D1FADF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    color: colors.success,
    fontWeight: '900',
    fontSize: 24
  },
  title: {
    marginTop: 18,
    color: colors.textStrong,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    textAlign: 'center'
  },
  subtitle: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 330
  },
  detailsCard: {
    marginTop: 28,
    alignSelf: 'stretch',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10
  },
  rowLabel: {
    color: colors.textMuted,
    fontWeight: '600'
  },
  rowValue: {
    color: colors.textStrong,
    fontWeight: '800'
  },
  actions: {
    marginTop: 'auto',
    alignSelf: 'stretch',
    gap: 10
  },
  secondary: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryLabel: {
    color: colors.textStrong,
    fontWeight: '800'
  }
});
