import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppCard } from '../../components/ui/AppCard';
import { AppChip } from '../../components/ui/AppChip';
import { RootStackParamList } from '../../navigation/screenConfig';
import { BottomNav } from '../../components/ui/BottomNav';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Bookings'>;
type BookingTab = 'Proximas' | 'Pasadas';

export function Bookings({ navigation }: Props) {
  const { bookings, selectBooking, selectChef } = useAppState();
  const [activeTab, setActiveTab] = useState<BookingTab>('Proximas');

  const visibleBookings = useMemo(() => {
    if (activeTab === 'Pasadas') {
      return bookings.filter((item) => item.status === 'Cancelada');
    }

    return bookings.filter((item) => item.status !== 'Cancelada');
  }, [activeTab, bookings]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader title="Reservas" rightAction="Historial" onRightAction={() => {}} />

          <View style={styles.tabsRow}>
            <AppChip label="Proximas" selected={activeTab === 'Proximas'} onPress={() => setActiveTab('Proximas')} />
            <AppChip label="Pasadas" selected={activeTab === 'Pasadas'} onPress={() => setActiveTab('Pasadas')} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {visibleBookings.map((item) => (
              <AppCard
                key={item.id}
                style={styles.card}
                onPress={() => {
                  selectBooking(item.id);
                  selectChef(item.chefId);
                  navigation.navigate('BookingDetails');
                }}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardId}>#{item.id}</Text>
                  <Text style={[styles.badge, item.status === 'Confirmada' ? styles.badgeOk : styles.badgePending]}>{item.status}</Text>
                </View>
                <Text style={styles.cardChef}>{item.chefName}</Text>
                <Text style={styles.cardDate}>{item.dateLabel}  -  {item.timeLabel}</Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardPrice}>${item.total} MXN</Text>
                  <Text style={styles.cardAction}>Ver detalle</Text>
                </View>
              </AppCard>
            ))}
            {visibleBookings.length === 0 ? <Text style={styles.emptyState}>No hay reservas en esta pestaña.</Text> : null}
          </ScrollView>
        </View>

        <BottomNav activeTab="Bookings" onNavigate={(route) => navigation.navigate(route)} />
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
  tabsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8
  },
  list: {
    marginTop: 14,
    gap: 10,
    paddingBottom: 12
  },
  card: {
    padding: 14,
    gap: 8
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardId: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 12
  },
  badge: {
    minHeight: 24,
    borderRadius: 999,
    paddingHorizontal: 10,
    overflow: 'hidden',
    textAlignVertical: 'center',
    fontSize: 11,
    fontWeight: '800',
    includeFontPadding: false,
    lineHeight: 24
  },
  badgeOk: {
    color: '#067647',
    backgroundColor: '#ECFDF3'
  },
  badgePending: {
    color: '#B54708',
    backgroundColor: '#FFFAEB'
  },
  cardChef: {
    color: colors.textStrong,
    fontWeight: '900',
    fontSize: 18
  },
  cardDate: {
    color: colors.textMuted,
    fontWeight: '600'
  },
  cardBottom: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardPrice: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 16
  },
  cardAction: {
    color: colors.primary,
    fontWeight: '800'
  },
  emptyState: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16
  }
});
