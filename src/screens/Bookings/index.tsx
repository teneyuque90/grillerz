import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { grillerzApi } from '../../api/grillerzApi';
import { AppCard } from '../../components/ui/AppCard';
import { AppChip } from '../../components/ui/AppChip';
import { OFFLINE_DEMO_MODE } from '../../config/api';
import { RootStackParamList } from '../../navigation/screenConfig';
import { BottomNav } from '../../components/ui/BottomNav';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useAppState } from '../../state/AppStateContext';
import { colors } from '../../theme/colors';
import { Booking } from '../../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'Bookings'>;
type BookingTab = 'Proximas' | 'Pasadas';

export function Bookings({ navigation }: Props) {
  const { authUser, bookings, selectBooking, selectChef } = useAppState();
  const [activeTab, setActiveTab] = useState<BookingTab>('Proximas');
  const [grillerBookings, setGrillerBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const isGrillerView = authUser?.role === 'griller' || authUser?.role === 'admin';
  const managedChefId = authUser?.managedChefId ?? undefined;

  useEffect(() => {
    let active = true;

    if (!isGrillerView) {
      setGrillerBookings([]);
      return () => {
        active = false;
      };
    }

    if (OFFLINE_DEMO_MODE) {
      const fallback = bookings.filter((item) => {
        if (authUser?.role === 'admin') {
          return true;
        }
        return item.chefId === managedChefId;
      });
      setGrillerBookings(fallback);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    async function load() {
      try {
        const remote = await grillerzApi.getGrillerBookings(authUser?.role === 'admin' ? undefined : managedChefId);
        if (active) {
          setGrillerBookings(remote);
        }
      } catch {
        if (active) {
          setGrillerBookings([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [authUser?.role, bookings, isGrillerView, managedChefId]);

  async function updateStatus(bookingId: string, status: 'Confirmada' | 'Cancelada') {
    if (updatingBookingId) {
      return;
    }

    setUpdatingBookingId(bookingId);
    if (OFFLINE_DEMO_MODE) {
      setGrillerBookings((prev) => prev.map((item) => (item.id === bookingId ? { ...item, status } : item)));
      setUpdatingBookingId(null);
      return;
    }

    try {
      const updated = await grillerzApi.updateBookingStatus(bookingId, status);
      setGrillerBookings((prev) => prev.map((item) => (item.id === bookingId ? updated : item)));
    } catch {
      // keep current list
    } finally {
      setUpdatingBookingId(null);
    }
  }

  const visibleBookings = useMemo(() => {
    const source = isGrillerView ? grillerBookings : bookings;
    if (activeTab === 'Pasadas') {
      return source.filter((item) => item.status === 'Cancelada');
    }

    return source.filter((item) => item.status !== 'Cancelada');
  }, [activeTab, bookings, grillerBookings, isGrillerView]);

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
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.loadingText}>Cargando solicitudes del griller...</Text>
              </View>
            ) : null}
            {visibleBookings.map((item) => (
              <AppCard
                key={item.id}
                style={styles.card}
                onPress={() => {
                  if (isGrillerView) {
                    return;
                  }
                  selectBooking(item.id);
                  selectChef(item.chefId);
                  navigation.navigate('BookingDetails');
                }}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardId}>#{item.id}</Text>
                  <Text
                    style={[
                      styles.badge,
                      item.status === 'Confirmada' ? styles.badgeOk : null,
                      item.status === 'Pendiente' ? styles.badgePending : null,
                      item.status === 'Cancelada' ? styles.badgeCancelled : null
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
                <Text style={styles.cardChef}>{item.chefName}</Text>
                <Text style={styles.cardDate}>{item.dateLabel}  -  {item.timeLabel}</Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardPrice}>${item.total} MXN</Text>
                  <Text style={styles.cardAction}>{isGrillerView ? 'Solicitud' : 'Ver detalle'}</Text>
                </View>
                {isGrillerView && item.status === 'Pendiente' ? (
                  <View style={styles.actionsRow}>
                    <Pressable
                      style={[styles.actionButton, styles.acceptButton, updatingBookingId === item.id ? styles.disabledButton : null]}
                      onPress={() => {
                        void updateStatus(item.id, 'Confirmada');
                      }}
                    >
                      <Text style={styles.actionLabel}>Aceptar</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionButton, styles.rejectButton, updatingBookingId === item.id ? styles.disabledButton : null]}
                      onPress={() => {
                        void updateStatus(item.id, 'Cancelada');
                      }}
                    >
                      <Text style={[styles.actionLabel, styles.rejectLabel]}>Rechazar</Text>
                    </Pressable>
                  </View>
                ) : null}
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
  loadingRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  loadingText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 13
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
  badgeCancelled: {
    color: '#B42318',
    backgroundColor: '#FEE4E2'
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
  actionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    flex: 1,
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  acceptButton: {
    backgroundColor: '#ECFDF3',
    borderColor: '#A6F4C5'
  },
  rejectButton: {
    backgroundColor: '#FFF5F4',
    borderColor: '#FBC4BE'
  },
  actionLabel: {
    color: '#067647',
    fontWeight: '800',
    fontSize: 12
  },
  rejectLabel: {
    color: '#B42318'
  },
  disabledButton: {
    opacity: 0.6
  },
  emptyState: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16
  }
});
