import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

type PromoSyncResult = {
  ok: boolean;
  permissionStatus: PermissionStatus;
  message?: string;
};

const PROMO_KIND = 'marketing-promo';
const PROMO_CHANNEL_ID = 'grillerz-promotions';

const promoSlots = [
  {
    id: 'daily-midday',
    title: '🔥 Novedades Grillerz',
    body: 'Hay grillers con disponibilidad para hoy en tu zona.',
    hour: 11,
    minute: 30
  },
  {
    id: 'daily-evening',
    title: '💸 Oferta del dia',
    body: 'Reserva hoy y revisa promociones especiales en paquetes premium.',
    hour: 18,
    minute: 15
  },
  {
    id: 'daily-night',
    title: '🍖 Promos para tu parrillada',
    body: 'Explora cortes y eventos nuevos de grillers verificados.',
    hour: 20,
    minute: 0
  }
] as const;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

function normalizePermissionStatus(status: Notifications.PermissionStatus): PermissionStatus {
  if (status === 'granted') {
    return 'granted';
  }

  if (status === 'denied') {
    return 'denied';
  }

  return 'undetermined';
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(PROMO_CHANNEL_ID, {
    name: 'Promociones Grillerz',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 150, 200],
    lightColor: '#E53935',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
  });
}

async function cancelPromoNotifications() {
  const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
  const promoScheduled = allScheduled.filter((item) => item.content.data?.kind === PROMO_KIND);

  await Promise.all(
    promoScheduled.map((item) => {
      return Notifications.cancelScheduledNotificationAsync(item.identifier);
    })
  );
}

async function requestPermission(): Promise<PermissionStatus> {
  const existing = await Notifications.getPermissionsAsync();

  if (existing.status === 'granted') {
    return 'granted';
  }

  const asked = await Notifications.requestPermissionsAsync();
  return normalizePermissionStatus(asked.status);
}

export async function syncPromoNotifications(enabled: boolean): Promise<PromoSyncResult> {
  if (!enabled) {
    await cancelPromoNotifications();
    return {
      ok: true,
      permissionStatus: 'undetermined'
    };
  }

  const permissionStatus = await requestPermission();

  if (permissionStatus !== 'granted') {
    await cancelPromoNotifications();
    return {
      ok: false,
      permissionStatus,
      message: 'Permiso de notificaciones no concedido.'
    };
  }

  await ensureAndroidChannel();
  await cancelPromoNotifications();

  for (const slot of promoSlots) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: slot.title,
        body: slot.body,
        data: {
          kind: PROMO_KIND,
          slotId: slot.id
        },
        sound: false
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: slot.hour,
        minute: slot.minute
      }
    });
  }

  return {
    ok: true,
    permissionStatus
  };
}

export async function sendPromoTestNotification() {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎉 Promo de prueba Grillerz',
      body: 'Esta es una notificacion de prueba para validar ofertas y novedades.',
      data: {
        kind: PROMO_KIND,
        test: true
      },
      sound: false
    },
    trigger: null
  });
}
