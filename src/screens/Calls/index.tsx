import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Calls'>;

const calls = [
  { name: 'Erick Martinez', type: 'Llamada saliente', when: 'Hoy 6:32 PM', status: 'Completada' },
  { name: 'Carlos BBQ', type: 'Llamada entrante', when: 'Hoy 4:18 PM', status: 'Perdida' },
  { name: 'Martin Asador', type: 'Llamada saliente', when: 'Ayer 8:04 PM', status: 'Completada' }
];

export function Calls({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader
            title="Calls"
            onBack={() => navigation.goBack()}
            rightAction="Contactos"
            onRightAction={() => navigation.navigate('Connect')}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {calls.map((call) => (
              <Pressable key={`${call.name}-${call.when}`} style={styles.item} onPress={() => navigation.navigate('Chat')}>
                <View style={styles.avatar} />
                <View style={styles.itemBody}>
                  <Text style={styles.name}>{call.name}</Text>
                  <Text style={styles.meta}>{call.type}</Text>
                  <Text style={styles.when}>{call.when}</Text>
                </View>
                <View style={styles.rightCol}>
                  <Text style={[styles.status, call.status === 'Perdida' ? styles.statusMissed : null]}>{call.status}</Text>
                  <Text style={styles.callNow}>Llamar</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
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
    backgroundColor: colors.background
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20
  },
  list: {
    marginTop: 12,
    gap: 10,
    paddingBottom: 12
  },
  item: {
    minHeight: 86,
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
    gap: 2
  },
  name: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: '800'
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  when: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700'
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6
  },
  status: {
    color: '#067647',
    fontSize: 12,
    fontWeight: '800'
  },
  statusMissed: {
    color: colors.primaryDark
  },
  callNow: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12
  }
});
