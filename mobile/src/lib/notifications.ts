import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { supabase } from './supabase';

// Configure how notifications are handled when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registers the device for push notifications and returns the Expo Push Token.
 * Also saves the token to the user's profile in Supabase if a session exists.
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2e7d32',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    // Replace with your actual Expo project ID from app.json
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'b5e1a1b1-1234-4321-8888-1234567890ab', // Mock ID, user should update
    })).data;

    // Save token to Supabase if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session && token) {
      await supabase
        .from('profiles')
        .update({ expo_push_token: token })
        .eq('id', session.user.id);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Sends a local notification (useful for order updates or testing)
 */
export async function scheduleLocalNotification(title: string, body: string, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // send immediately
  });
}

/**
 * Hook-like function to handle notification clicks
 */
export function addNotificationResponseListener(callback: (data: any) => void) {
  return Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    callback(data);
  });
}
