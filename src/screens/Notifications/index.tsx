import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomNav } from '../../components/ui/BottomNav';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const todayItems = [
  { title: 'Reserva confirmada', body: 'Erick Martinez acepto tu reserva #GRZ-4831', route: 'BookingDetails' as const },
  { title: 'Nuevo mensaje', body: 'Tienes un mensaje de Carlos BBQ', route: 'Chat' as const }
];

const previousItems = [
  { title: 'Recordatorio de pago', body: 'Tu reserva de este viernes esta pagada', route: 'Bookings' as const },
  { title: 'Chef cercano', body: 'Martin Asador esta disponible hoy en tu zona', route: 'Profile' as const }
];

export function Notifications({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader title="Notificaciones" rightAction="Limpiar" onRightAction={() => {}} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Hoy</Text>
            {todayItems.map((item) => (
              <Pressable key={item.title} style={styles.item} onPress={() => navigation.navigate(item.route)}>
                <View style={styles.dot} />
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemText}>{item.body}</Text>
                </View>
                <Text style={styles.chevron}>{'>'}</Text>
              </Pressable>
            ))}

            <Text style={styles.sectionTitle}>Anteriores</Text>
            {previousItems.map((item) => (
              <Pressable key={item.title} style={styles.item} onPress={() => navigation.navigate(item.route)}>
                <View style={styles.dotMuted} />
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemText}>{item.body}</Text>
                </View>
                <Text style={styles.chevron}>{'>'}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <BottomNav activeTab="Settings" onNavigate={(route) => navigation.navigate(route)} />
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
    paddingTop: 12,
    gap: 10,
    paddingBottom: 12
  },
  sectionTitle: {
    marginTop: 6,
    color: colors.textStrong,
    fontSize: 19,
    fontWeight: '900'
  },
  item: {
    minHeight: 78,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: colors.primary
  },
  dotMuted: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: colors.borderStrong
  },
  itemBody: {
    flex: 1,
    gap: 2
  },
  itemTitle: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: '800'
  },
  itemText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  chevron: {
    color: colors.textSoft,
    fontWeight: '900'
  }
});
