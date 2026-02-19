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
import { Booking, BookingStatus } from '../../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'Bookings'>;
type BookingTab = 'Proximas' | 'Pasadas';

const finalizedStatuses: BookingStatus[] = ['Completada', 'Cancelada'];
const statusProgressNext: Record<BookingStatus, BookingStatus | null> = {
  Pendiente: 'Confirmada',
  Confirmada: 'En camino',
  'En camino': 'En servicio',
  'En servicio': 'Completada',
  Completada: null,
  Cancelada: null
};
const statusProgressLabel: Record<BookingStatus, string> = {
  Pendiente: 'Aceptar',
  Confirmada: 'Marcar en camino',
  'En camino': 'Marcar en servicio',
  'En servicio': 'Marcar completada',
  Completada: 'Completada',
  Cancelada: 'Cancelada'
};

function canCancelBooking(status: BookingStatus): boolean {
  return status === 'Pendiente' || status === 'Confirmada' || status === 'En camino';
}

function badgeStyleByStatus(status: BookingStatus) {
  switch (status) {
    case 'Pendiente':
      return styles.badgePending;
    case 'Confirmada':
      return styles.badgeOk;
    case 'En camino':
      return styles.badgeRoute;
    case 'En servicio':
      return styles.badgeService;
    case 'Completada':
      return styles.badgeDone;
    case 'Cancelada':
      return styles.badgeCancelled;
    default:
      return styles.badgePending;
  }
}

export function Bookings({ navigation }: Props) {
  const { authUser, bookings, replaceBookings, selectBooking, selectChef } = useAppState();
  const [activeTab, setActiveTab] = useState<BookingTab>('Proximas');
  const [clientBookings, setClientBookings] = useState<Booking[]>(bookings);
  const [grillerBookings, setGrillerBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const isGrillerView = authUser?.role === 'griller' || authUser?.role === 'admin';
  const managedChefId = authUser?.managedChefId ?? undefined;

  useEffect(() => {
    if (!isGrillerView) {
      setClientBookings(bookings);
    }
  }, [bookings, isGrillerView]);

  useEffect(() => {
    if (!OFFLINE_DEMO_MODE || !isGrillerView) {
      return;
    }

    const fallback = bookings.filter((item) => {
      if (authUser?.role === 'admin') {
        return true;
      }
      return item.chefId === managedChefId;
    });
    setGrillerBookings(fallback);
  }, [authUser?.role, bookings, isGrillerView, managedChefId]);

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function loadGrillerBookings() {
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

    async function loadClientBookings() {
      try {
        const remote = await grillerzApi.getBookings();
        if (active) {
          setClientBookings(remote);
          replaceBookings(remote);
        }
      } catch {
        if (active) {
          setClientBookings(bookings);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (OFFLINE_DEMO_MODE) {
      if (!isGrillerView) {
        setClientBookings(bookings);
      }

      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    if (isGrillerView) {
      void loadGrillerBookings();
      intervalId = setInterval(() => {
        void loadGrillerBookings();
      }, 12000);
    } else {
      void loadClientBookings();
      intervalId = setInterval(() => {
        void loadClientBookings();
      }, 12000);
    }

    return () => {
      active = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [authUser?.role, isGrillerView, managedChefId, replaceBookings]);

  async function updateStatus(bookingId: string, status: BookingStatus) {
    if (updatingBookingId) {
      return;
    }

    setUpdatingBookingId(bookingId);

    if (OFFLINE_DEMO_MODE) {
      if (isGrillerView) {
        setGrillerBookings((prev) => prev.map((item) => (item.id === bookingId ? { ...item, status } : item)));
      } else {
        setClientBookings((prev) => prev.map((item) => (item.id === bookingId ? { ...item, status } : item)));
      }
      setUpdatingBookingId(null);
      return;
    }

    try {
      const updated = await grillerzApi.updateBookingStatus(bookingId, status);

      if (isGrillerView) {
        setGrillerBookings((prev) => prev.map((item) => (item.id === bookingId ? updated : item)));
      } else {
        setClientBookings((prev) => {
          const next = prev.map((item) => (item.id === bookingId ? updated : item));
          replaceBookings(next);
          return next;
        });
      }
    } catch {
      // keep current list
    } finally {
      setUpdatingBookingId(null);
    }
  }

  const visibleBookings = useMemo(() => {
    const source = isGrillerView ? grillerBookings : clientBookings;

    if (activeTab === 'Pasadas') {
      return source.filter((item) => finalizedStatuses.includes(item.status));
    }

    return source.filter((item) => !finalizedStatuses.includes(item.status));
  }, [activeTab, clientBookings, grillerBookings, isGrillerView]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader title="Reservas" rightAction="Historial" onRightAction={() => setActiveTab('Pasadas')} />

          <View style={styles.tabsRow}>
            <AppChip label="Proximas" selected={activeTab === 'Proximas'} onPress={() => setActiveTab('Proximas')} />
            <AppChip label="Pasadas" selected={activeTab === 'Pasadas'} onPress={() => setActiveTab('Pasadas')} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.loadingText}>
                  {isGrillerView ? 'Actualizando solicitudes del griller...' : 'Actualizando estado de tus reservas...'}
                </Text>
              </View>
            ) : null}

            {visibleBookings.map((item) => {
              const nextStatus = statusProgressNext[item.status];

              return (
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
                    <Text style={[styles.badge, badgeStyleByStatus(item.status)]}>{item.status}</Text>
                  </View>
                  <Text style={styles.cardChef}>{item.chefName}</Text>
                  <Text style={styles.cardDate}>{item.dateLabel}  -  {item.timeLabel}</Text>
                  <View style={styles.cardBottom}>
                    <Text style={styles.cardPrice}>${item.total} MXN</Text>
                    <Text style={styles.cardAction}>{isGrillerView ? 'Gestion de servicio' : 'Ver detalle'}</Text>
                  </View>

                  {isGrillerView ? (
                    <View style={styles.actionsRow}>
                      {nextStatus ? (
                        <Pressable
                          style={[styles.actionButton, styles.acceptButton, updatingBookingId === item.id ? styles.disabledButton : null]}
                          onPress={() => {
                            void updateStatus(item.id, nextStatus);
                          }}
                        >
                          <Text style={styles.actionLabel}>{statusProgressLabel[item.status]}</Text>
                        </Pressable>
                      ) : null}

                      {canCancelBooking(item.status) ? (
                        <Pressable
                          style={[styles.actionButton, styles.rejectButton, updatingBookingId === item.id ? styles.disabledButton : null]}
                          onPress={() => {
                            void updateStatus(item.id, 'Cancelada');
                          }}
                        >
                          <Text style={[styles.actionLabel, styles.rejectLabel]}>Cancelar</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ) : null}
                </AppCard>
              );
            })}

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
  badgePending: {
    color: '#B54708',
    backgroundColor: '#FFFAEB'
  },
  badgeOk: {
    color: '#067647',
    backgroundColor: '#ECFDF3'
  },
  badgeRoute: {
    color: '#175CD3',
    backgroundColor: '#EFF8FF'
  },
  badgeService: {
    color: '#6E2A9C',
    backgroundColor: '#F9F5FF'
  },
  badgeDone: {
    color: '#027A48',
    backgroundColor: '#ECFDF3'
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
