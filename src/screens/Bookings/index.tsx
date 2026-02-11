import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { BottomNav } from '../../components/ui/BottomNav';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Bookings'>;

export function Bookings({ navigation }: Props) {
  const { bookings, selectBooking, selectChef } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader title="Reservas" rightAction="Historial" onRightAction={() => {}} />

          <View style={styles.tabsRow}>
            <View style={[styles.tab, styles.tabActive]}>
              <Text style={[styles.tabLabel, styles.tabLabelActive]}>Proximas</Text>
            </View>
            <View style={styles.tab}>
              <Text style={styles.tabLabel}>Pasadas</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {bookings.map((item) => (
              <Pressable
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
                <Text style={styles.cardAction}>Ver detalle</Text>
              </Pressable>
            ))}
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
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  tabLabel: {
    color: colors.textMuted,
    fontWeight: '700'
  },
  tabLabelActive: {
    color: colors.primaryDark
  },
  list: {
    marginTop: 14,
    gap: 10,
    paddingBottom: 12
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
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
  cardAction: {
    marginTop: 2,
    color: colors.primary,
    fontWeight: '800'
  }
});
