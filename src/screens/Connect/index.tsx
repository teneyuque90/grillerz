import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BottomNav } from '../../components/ui/BottomNav';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Connect'>;

const contacts = [
  { name: 'Erick Martinez', preview: 'Perfecto, nos vemos a las 7:00 PM', status: 'Online', unread: 2 },
  { name: 'Carlos BBQ', preview: 'Ya revise tu direccion', status: 'Hace 5 min', unread: 0 },
  { name: 'Martin Asador', preview: 'Te comparto menu sugerido', status: 'Ayer', unread: 1 },
  { name: 'Luis BBQ', preview: 'Confirmado para el domingo', status: 'Ayer', unread: 0 }
];

export function Connect({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader
            title="Connect"
            rightAction="Llamadas"
            onRightAction={() => navigation.navigate('Calls')}
          />

          <View style={styles.searchFake}>
            <Text style={styles.searchText}>Buscar contacto o griller...</Text>
          </View>

          <View style={styles.tabsRow}>
            <View style={[styles.tab, styles.tabActive]}>
              <Text style={[styles.tabLabel, styles.tabLabelActive]}>Chats</Text>
            </View>
            <Pressable style={styles.tab} onPress={() => navigation.navigate('Calls')}>
              <Text style={styles.tabLabel}>Calls</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {contacts.map((contact) => (
              <Pressable key={contact.name} style={styles.item} onPress={() => navigation.navigate('Chat')}>
                <View style={styles.avatar} />
                <View style={styles.itemBody}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{contact.name}</Text>
                    <Text style={styles.time}>{contact.status}</Text>
                  </View>
                  <Text style={styles.preview}>{contact.preview}</Text>
                </View>
                {contact.unread > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadLabel}>{contact.unread}</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
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
  searchFake: {
    marginTop: 10,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 14
  },
  searchText: {
    color: colors.textSoft,
    fontSize: 15
  },
  tabsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8
  },
  tab: {
    flex: 1,
    minHeight: 38,
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
  item: {
    minHeight: 84,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#FFE5E2'
  },
  itemBody: {
    flex: 1,
    gap: 4
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  name: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '800'
  },
  time: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700'
  },
  preview: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  unreadLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11
  }
});
