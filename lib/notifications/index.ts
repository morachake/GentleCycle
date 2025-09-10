import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Request permissions
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('period-reminders', {
          name: 'Period Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#E91E63',
        });

        await Notifications.setNotificationChannelAsync('fertility-reminders', {
          name: 'Fertility Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4CAF50',
        });

        await Notifications.setNotificationChannelAsync('symptom-reminders', {
          name: 'Symptom Reminders',
          importance: Notifications.AndroidImportance.LOW,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#9C27B0',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Schedule period reminder
  async schedulePeriodReminder(daysUntilPeriod: number): Promise<string | null> {
    try {
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + daysUntilPeriod - 2); // 2 days before
      reminderDate.setHours(9, 0, 0, 0); // 9 AM

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Period Reminder 🩸',
          body: 'Your period is expected to start in 2 days. Make sure you\'re prepared!',
          data: { type: 'period-reminder' },
          sound: true,
        },
        trigger: {
          date: reminderDate,
          channelId: 'period-reminders',
        },
      });

      console.log('Period reminder scheduled for:', reminderDate);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling period reminder:', error);
      return null;
    }
  }

  // Schedule fertility window reminder
  async scheduleFertilityReminder(daysUntilOvulation: number): Promise<string | null> {
    try {
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + daysUntilOvulation - 1); // 1 day before
      reminderDate.setHours(8, 0, 0, 0); // 8 AM

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Fertility Window 🥚',
          body: 'You\'re entering your fertile window. Track any symptoms or changes!',
          data: { type: 'fertility-reminder' },
          sound: true,
        },
        trigger: {
          date: reminderDate,
          channelId: 'fertility-reminders',
        },
      });

      console.log('Fertility reminder scheduled for:', reminderDate);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling fertility reminder:', error);
      return null;
    }
  }

  // Schedule daily symptom reminder
  async scheduleDailySymptomReminder(): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Check-in 💭',
          body: 'How are you feeling today? Take a moment to log your symptoms.',
          data: { type: 'symptom-reminder' },
          sound: false,
        },
        trigger: {
          hour: 20, // 8 PM
          minute: 0,
          repeats: true,
          channelId: 'symptom-reminders',
        },
      });

      console.log('Daily symptom reminder scheduled');
      return notificationId;
    } catch (error) {
      console.error('Error scheduling daily symptom reminder:', error);
      return null;
    }
  }

  // Schedule medication reminder
  async scheduleMedicationReminder(
    title: string,
    time: { hour: number; minute: number },
    days: number[] = [] // Empty array means daily
  ): Promise<string | null> {
    try {
      const trigger = days.length > 0
        ? { weekday: days[0], hour: time.hour, minute: time.minute, repeats: true }
        : { hour: time.hour, minute: time.minute, repeats: true };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Medication Reminder 💊',
          body: title,
          data: { type: 'medication-reminder' },
          sound: true,
        },
        trigger: {
          ...trigger,
          channelId: 'period-reminders',
        },
      });

      console.log('Medication reminder scheduled');
      return notificationId;
    } catch (error) {
      console.error('Error scheduling medication reminder:', error);
      return null;
    }
  }

  // Cancel specific notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Handle notification received while app is open
  addNotificationReceivedListener(
    handler: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(handler);
  }

  // Handle notification response (when user taps notification)
  addNotificationResponseReceivedListener(
    handler: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(handler);
  }

  // Auto-schedule reminders based on cycle data
  async autoScheduleReminders(
    daysUntilPeriod: number,
    daysUntilOvulation: number,
    settings: {
      periodReminder: boolean;
      fertilityReminder: boolean;
      symptomReminder: boolean;
    }
  ): Promise<void> {
    try {
      // Cancel existing reminders first
      await this.cancelAllNotifications();

      const scheduledIds: string[] = [];

      if (settings.periodReminder && daysUntilPeriod > 2) {
        const id = await this.schedulePeriodReminder(daysUntilPeriod);
        if (id) scheduledIds.push(id);
      }

      if (settings.fertilityReminder && daysUntilOvulation > 1) {
        const id = await this.scheduleFertilityReminder(daysUntilOvulation);
        if (id) scheduledIds.push(id);
      }

      if (settings.symptomReminder) {
        const id = await this.scheduleDailySymptomReminder();
        if (id) scheduledIds.push(id);
      }

      console.log(`Scheduled ${scheduledIds.length} notifications`);
    } catch (error) {
      console.error('Error auto-scheduling reminders:', error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();