import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

type AppTab = 'Browse01' | 'Search' | 'Bookings' | 'Profile' | 'Settings';

type BottomNavProps = {
  activeTab: AppTab;
  onNavigate: (route: AppTab) => void;
};

const tabs: Array<{ route: AppTab; icon: React.ComponentProps<typeof Ionicons>['name']; iconActive: React.ComponentProps<typeof Ionicons>['name']; label: string }> = [
  { route: 'Browse01', icon: 'flame-outline', iconActive: 'flame', label: 'Inicio' },
  { route: 'Search', icon: 'search-outline', iconActive: 'search', label: 'Buscar' },
  { route: 'Bookings', icon: 'calendar-outline', iconActive: 'calendar', label: 'Reservas' },
  { route: 'Profile', icon: 'person-outline', iconActive: 'person', label: 'Perfil' },
  { route: 'Settings', icon: 'settings-outline', iconActive: 'settings', label: 'Ajustes' }
];

export function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = tab.route === activeTab;

        return (
          <Pressable key={tab.route} style={styles.tabItem} onPress={() => onNavigate(tab.route)}>
            <Ionicons
              name={active ? tab.iconActive : tab.icon}
              size={19}
              color={active ? colors.primary : colors.textSoft}
            />
            <Text style={[styles.tabText, active ? styles.tabActive : null]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    minHeight: 74,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 54
  },
  tabText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '700'
  },
  tabActive: {
    color: colors.primary
  }
});
