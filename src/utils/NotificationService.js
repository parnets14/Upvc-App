import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import axios from 'axios';

class NotificationService {
  constructor() {
    this.configure();
  }

  configure = () => {
    // Configure local notifications
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        
        // Handle notification tap
        if (notification.userInteraction) {
          console.log('User tapped notification');
        }
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
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
  };

  // Request notification permission
  requestUserPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          // Android 13+ requires explicit permission request
          const PermissionsAndroid = require('react-native').PermissionsAndroid;
          
          // First check if permission is already granted
          const checkResult = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          
          if (checkResult) {
            console.log('Notification permission already granted');
            return true;
          }
          
          // Request permission
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Enable Notifications',
              message: 'Get instant updates about your leads, application status, and important business opportunities.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'Allow',
            }
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission granted');
            // Also request Firebase permission
            const authStatus = await messaging().requestPermission();
            return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                   authStatus === messaging.AuthorizationStatus.PROVISIONAL;
          } else {
            console.log('Notification permission denied');
            return false;
          }
        } else {
          // Android 12 and below - Firebase handles it
          const authStatus = await messaging().requestPermission();
          const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
          
          if (enabled) {
            console.log('Authorization status:', authStatus);
            return true;
          }
          return false;
        }
      } else {
        // iOS
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', authStatus);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Check if notification permission is granted
  checkNotificationPermission = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const PermissionsAndroid = require('react-native').PermissionsAndroid;
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted;
      } else {
        // For Android 12 and below, or iOS
        const authStatus = await messaging().hasPermission();
        return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
               authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      }
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  };

  // Get FCM token
  getFCMToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        await AsyncStorage.setItem('fcmToken', fcmToken);
        return fcmToken;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
    return null;
  };

  // Update FCM token on backend (for sellers)
  updateFCMTokenOnBackend = async (token) => {
    try {
      const sellerToken = await AsyncStorage.getItem('sellerToken');
      if (!sellerToken) {
        console.log('No seller token found, skipping FCM token update');
        return false;
      }

      const response = await axios.post(
        'https://upvcconnect.com/api/sellers/update-fcm-token',
        { fcmToken: token },
        {
          headers: {
            Authorization: `Bearer ${sellerToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        console.log('FCM token updated on backend successfully');
        return true;
      }
    } catch (error) {
      console.error('Error updating FCM token on backend:', error.response?.data || error.message);
    }
    return false;
  };

  // Update FCM token on backend (for buyers)
  updateBuyerFCMTokenOnBackend = async (token) => {
    try {
      const buyerToken = await AsyncStorage.getItem('buyerToken');
      if (!buyerToken) {
        console.log('No buyer token found, skipping FCM token update');
        return false;
      }

      console.log('Updating buyer FCM token on backend...');
      console.log('Buyer Token:', buyerToken.substring(0, 20) + '...');
      console.log('FCM Token:', token.substring(0, 20) + '...');

      const response = await axios.post(
        'https://upvcconnect.com/api/admin/buyers/update-fcm-token',
        { fcmToken: token },
        {
          headers: {
            Authorization: `Bearer ${buyerToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Buyer FCM token update response:', response.data);

      if (response.data.success) {
        console.log('Buyer FCM token updated on backend successfully');
        return true;
      }
    } catch (error) {
      console.error('Error updating buyer FCM token on backend:', error.response?.data || error.message);
      console.error('Full error:', error);
    }
    return false;
  };

  // Listen for token refresh
  onTokenRefresh = (callback) => {
    return messaging().onTokenRefresh(async (token) => {
      console.log('Token refreshed:', token);
      await AsyncStorage.setItem('fcmToken', token);
      // Update token on backend when it refreshes
      await this.updateFCMTokenOnBackend(token);
      await this.updateBuyerFCMTokenOnBackend(token);
      if (callback) callback(token);
    });
  };

  // Handle foreground messages
  onMessageReceived = (callback) => {
    return messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', remoteMessage);
      
      // Show local notification when app is in foreground
      this.showLocalNotification(
        remoteMessage.notification?.title || 'New Notification',
        remoteMessage.notification?.body || '',
        remoteMessage.data || {}
      );

      if (callback) callback(remoteMessage);
    });
  };

  // Handle background messages
  setBackgroundMessageHandler = () => {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message received:', remoteMessage);
    });
  };

  // Show local notification
  showLocalNotification = (title, message, data = {}) => {
    PushNotification.localNotification({
      channelId: 'upvc-default-channel',
      title: title,
      message: message,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      vibrate: true,
      vibration: 300,
      userInfo: data,
    });
  };

  // Handle notification opened app
  onNotificationOpenedApp = (callback) => {
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification caused app to open:', remoteMessage);
      if (callback) callback(remoteMessage);
    });
  };

  // Check if app was opened by notification
  getInitialNotification = async (callback) => {
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      console.log('App opened by notification:', remoteMessage);
      if (callback) callback(remoteMessage);
    }
  };

  // Subscribe to topic
  subscribeToTopic = async (topic) => {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
    }
  };

  // Unsubscribe from topic
  unsubscribeFromTopic = async (topic) => {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  };

  // Cancel all notifications
  cancelAllNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
  };
}

export default new NotificationService();
