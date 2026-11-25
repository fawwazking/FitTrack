import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { REMINDER_DEFAULTS } from './config';

const isWeb = Platform.OS === 'web';

/**
 * Initialize notification handlers. Call once at app startup.
 */
export async function initNotifications(): Promise<void> {
  if (isWeb) return;
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Schedule a local notification reminder.
 * Returns the notification ID on success.
 */
export async function scheduleReminder(params: {
  id: string;
  type: string;
  mealType?: string | null;
  time: string; // "HH:MM"
  daysOfWeek: string; // JSON array of 0-6 (Sun-Sat)
  title: string;
  body: string;
}): Promise<string | null> {
  if (isWeb) return null;

  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return null;

  // Cancel existing notification for this reminder
  await Notifications.cancelScheduledNotificationAsync(params.id);

  // Parse time
  const [hours, minutes] = params.time.split(':').map(Number);

  // For MVP: schedule daily
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: params.title,
      body: params.body,
      sound: true,
      data: {
        reminderId: params.id,
        type: params.type,
        mealType: params.mealType ?? '',
      },
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
      channelId: 'fittrack-reminders',
    },
  });

  return notificationId;
}

/**
 * Cancel a scheduled notification.
 */
export async function cancelReminder(notificationId: string): Promise<void> {
  if (isWeb || !notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllReminders(): Promise<void> {
  if (isWeb) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get the default reminder times from config.
 */
export function getDefaultReminders() {
  return [
    { type: 'meal', mealType: 'breakfast', time: REMINDER_DEFAULTS.breakfast, title: 'Waktu sarapan', body: 'Jangan lupa catat sarapanmu.' },
    { type: 'meal', mealType: 'lunch', time: REMINDER_DEFAULTS.lunch, title: 'Waktu makan siang', body: 'Catat makan siangmu sekarang.' },
    { type: 'meal', mealType: 'dinner', time: REMINDER_DEFAULTS.dinner, title: 'Waktu makan malam', body: 'Jangan lewatkan mencatat makan malam.' },
    { type: 'meal', mealType: 'snack', time: REMINDER_DEFAULTS.snack, title: 'Camilan', body: 'Catat camilanmu kalau sudah makan.' },
    { type: 'workout', time: REMINDER_DEFAULTS.workout, title: 'Waktu latihan', body: 'Saatnya mulai sesi latihanmu.' },
    { type: 'weigh_in', time: REMINDER_DEFAULTS.weighIn, title: 'Timbang badan', body: 'Timbang badan pagi hari untuk tren akurat.' },
  ];
}
