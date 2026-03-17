/**
 * @format
 */

// Polyfill for findLastIndex (ES2019 feature) for React Navigation compatibility
if (!Array.prototype.findLastIndex) {
  Array.prototype.findLastIndex = function(callback, thisArg) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (callback.call(thisArg, this[i], i, this)) {
        return i;
      }
    }
    return -1;
  };
}

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

// Configure PushNotification for background notifications
PushNotification.configure({
  onRegister: function (token) {
    console.log('TOKEN:', token);
  },
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
  },
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
  popInitialNotification: true,
  requestPermissions: false,
});

// Create notification channel for Android
PushNotification.createChannel(
  {
    channelId: 'upvc-default-channel',
    channelName: 'UPVC Notifications',
    channelDescription: 'UPVC app notifications',
    playSound: true,
    soundName: 'default',
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`Channel created: ${created}`)
);

// Register background handler - manually show notification
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('🔔 BACKGROUND NOTIFICATION RECEIVED!');
  console.log('Title:', remoteMessage.notification?.title);
  console.log('Body:', remoteMessage.notification?.body);
  console.log('Data:', JSON.stringify(remoteMessage.data));
  
  const notifType = remoteMessage.data?.type;
  const isNewLead = notifType === 'new_lead';

  // Manually show notification to ensure it appears
  PushNotification.localNotification({
    channelId: 'upvc-default-channel',
    title: remoteMessage.notification?.title || remoteMessage.data?.title || 'UPVC Notification',
    message: remoteMessage.notification?.body || remoteMessage.data?.body || 'You have a new notification',
    playSound: true,
    soundName: 'default',
    vibrate: true,
    vibration: 300,
    importance: 'high',
    priority: 'high',
    // Pass data so onNotificationOpenedApp can navigate correctly
    userInfo: remoteMessage.data || {},
    data: remoteMessage.data || {},
  });
  
  return Promise.resolve();
});

AppRegistry.registerComponent(appName, () => App);
