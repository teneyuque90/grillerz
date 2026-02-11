import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/screenConfig';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const messages = [
  { id: '1', from: 'chef', text: 'Hola! Ya tengo todo listo para tu evento.', time: '6:10 PM' },
  { id: '2', from: 'user', text: 'Excelente, la direccion es Guanajuato 254.', time: '6:12 PM' },
  { id: '3', from: 'chef', text: 'Perfecto. Llegare 30 minutos antes para montar.', time: '6:14 PM' },
  { id: '4', from: 'user', text: 'Gracias, nos vemos manana.', time: '6:16 PM' }
] as const;

export function Chat({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>
          <ScreenHeader
            title="Erick Martinez"
            onBack={() => navigation.goBack()}
            rightAction="Llamar"
            onRightAction={() => navigation.navigate('Calls')}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.messagesWrap}>
            {messages.map((message) => {
              const isUser = message.from === 'user';

              return (
                <View key={message.id} style={[styles.messageRow, isUser ? styles.messageRowUser : null]}>
                  <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleChef]}>
                    <Text style={[styles.messageText, isUser ? styles.messageTextUser : null]}>{message.text}</Text>
                    <Text style={[styles.messageTime, isUser ? styles.messageTimeUser : null]}>{message.time}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.inputBar}>
          <Text style={styles.inputPlaceholder}>Escribe un mensaje...</Text>
          <Pressable style={styles.sendButton} onPress={() => navigation.navigate('Connect')}>
            <Text style={styles.sendLabel}>Enviar</Text>
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
    backgroundColor: colors.background
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10
  },
  messagesWrap: {
    paddingTop: 14,
    paddingBottom: 14,
    gap: 10
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  messageRowUser: {
    justifyContent: 'flex-end'
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4
  },
  bubbleChef: {
    backgroundColor: '#F2F4F7',
    borderWidth: 1,
    borderColor: colors.border
  },
  bubbleUser: {
    backgroundColor: colors.primary
  },
  messageText: {
    color: colors.textStrong,
    lineHeight: 20,
    fontSize: 14,
    fontWeight: '600'
  },
  messageTextUser: {
    color: '#FFFFFF'
  },
  messageTime: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '700'
  },
  messageTimeUser: {
    color: '#FFD9D3'
  },
  inputBar: {
    minHeight: 78,
    margin: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  inputPlaceholder: {
    color: colors.textSoft,
    fontSize: 15,
    flex: 1
  },
  sendButton: {
    minHeight: 40,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center'
  },
  sendLabel: {
    color: '#FFFFFF',
    fontWeight: '800'
  }
});
