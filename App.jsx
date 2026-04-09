import * as React from 'react';
import { View, Text, StyleSheet, AppState } from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import PermissionManager from './src/utils/PermissionManager';
import NotificationService from './src/utils/NotificationService';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from './src/config/api';

export default function App() {
  const navigationRef = React.useRef(null);
  const appState = React.useRef(AppState.currentState);

  // When app comes back to foreground, check if token was cleared (e.g. after logout)
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const sellerToken = await AsyncStorage.getItem('sellerToken');
        const buyerToken = await AsyncStorage.getItem('buyerToken');
        if (!sellerToken && !buyerToken && navigationRef.current) {
          // Don't redirect if user is in the middle of registration or OTP flow
          const currentRoute = navigationRef.current.getCurrentRoute();
          const registrationScreens = ['WelcomeProfileSetup', 'SellerOTPVerification', 'SellerLoginScreen', 'OTPVerification', 'BuyerOnboarding', 'PendingApproval'];
          if (currentRoute && registrationScreens.includes(currentRoute.name)) {
            return;
          }
          navigationRef.current.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'UserTypeSelection' }],
            })
          );
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);
  // Initialize startup permission policy on app launch
  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        // Mark app startup time to prevent permission requests during initial load
        // This addresses Google Play Store policy requirement 3.5
        await PermissionManager.checkStartupPermissionPolicy();
        console.log('App initialized with permission policy compliance');
        
        // Check if we should request notification permission
        const hasAskedBefore = await AsyncStorage.getItem('notification_permission_asked');
        if (!hasAskedBefore) {
          // Request permission directly after a short delay (no custom dialog)
          setTimeout(async () => {
            await AsyncStorage.setItem('notification_permission_asked', 'true');
            await initializeNotifications();
          }, 2000); // Wait 2 seconds after app start
        } else {
          // User has already been asked, initialize silently
          await initializeNotifications();
        }
      } catch (error) {
        console.error('Error initializing app permission policy:', error);
      }
    };

    initializeApp();
  }, []);

  const handleNotificationNavigation = (notificationType) => {
    if (!navigationRef.current) return;
    if (notificationType === 'new_lead') {
      navigationRef.current.navigate('SellerMain');
    } else if (notificationType === 'lead_purchased') {
      navigationRef.current.navigate('BuyerMain', { screen: 'ActiveLeads' });
    } else if (
      notificationType === 'application_rejection' ||
      notificationType === 'application_approval'
    ) {
      navigationRef.current.navigate('SellerMain');
    } else if (
      notificationType === 'document_rejection' ||
      notificationType === 'document_approval'
    ) {
      navigationRef.current.navigate('SellerMain');
    }
  };

  const initializeNotifications = async () => {
    try {
      // Request notification permission
      const hasPermission = await NotificationService.requestUserPermission();
      
      if (hasPermission) {
        // Get FCM token
        const fcmToken = await NotificationService.getFCMToken();
        
        if (fcmToken) {
          // Update FCM token on server if user is logged in
          const sellerToken = await AsyncStorage.getItem('sellerToken');
          if (sellerToken) {
            try {
              await axios.post(
                API_ENDPOINTS.SELLER_UPDATE_FCM_TOKEN || `${API_ENDPOINTS.SELLER_PROFILE}/update-fcm-token`,
                { fcmToken },
                {
                  headers: {
                    Authorization: `Bearer ${sellerToken}`,
                  },
                }
              );
              console.log('FCM token updated on server');
            } catch (error) {
              console.error('Error updating FCM token on server:', error);
            }
          }

          // Update FCM token for buyer if logged in
          const buyerToken = await AsyncStorage.getItem('buyerToken');
          if (buyerToken) {
            try {
              await axios.post(
                'https://upvcconnect.com/api/admin/buyers/update-fcm-token',
                { fcmToken },
                {
                  headers: {
                    Authorization: `Bearer ${buyerToken}`,
                  },
                }
              );
              console.log('Buyer FCM token updated on server');
            } catch (error) {
              console.error('Error updating buyer FCM token on server:', error);
            }
          }
        }

        // Listen for foreground messages
        const unsubscribeForeground = NotificationService.onMessageReceived((remoteMessage) => {
          console.log('Foreground notification received:', remoteMessage);
          
          const notificationType = remoteMessage.data?.type;
          const title = remoteMessage.notification?.title || 'New Notification';
          const body = remoteMessage.notification?.body || '';
          
          // Handle different notification types
          if (notificationType === 'application_rejection') {
            Toast.show({
              type: 'error',
              text1: title,
              text2: body,
              position: 'top',
              visibilityTime: 6000,
              autoHide: true,
            });
          } else if (notificationType === 'application_approval') {
            Toast.show({
              type: 'success',
              text1: title,
              text2: body,
              position: 'top',
              visibilityTime: 6000,
              autoHide: true,
            });
          } else if (notificationType === 'document_rejection') {
            Toast.show({
              type: 'error',
              text1: title,
              text2: body,
              position: 'top',
              visibilityTime: 6000,
              autoHide: true,
            });
          } else if (notificationType === 'document_approval') {
            Toast.show({
              type: 'success',
              text1: title,
              text2: body,
              position: 'top',
              visibilityTime: 6000,
              autoHide: true,
            });
          } else if (notificationType === 'new_lead') {
            Toast.show({
              type: 'success',
              text1: title || '🎯 New Lead Available!',
              text2: body,
              position: 'top',
              visibilityTime: 6000,
              autoHide: true,
              onPress: () => {
                if (navigationRef.current) {
                  navigationRef.current.navigate('SellerMain');
                }
              },
            });
          } else if (notificationType === 'lead_purchased') {
            Toast.show({
              type: 'success',
              text1: title || '🎉 Your lead is getting attention!',
              text2: body,
              position: 'top',
              visibilityTime: 6000,
              autoHide: true,
              onPress: () => {
                if (navigationRef.current) {
                  navigationRef.current.navigate('BuyerMain', { screen: 'ActiveLeads' });
                }
              },
            });
          } else {
            // Default notification display
            Toast.show({
              type: 'info',
              text1: title,
              text2: body,
              position: 'top',
              visibilityTime: 4000,
            });
          }
        });

        // Handle notification opened app (background → foreground tap)
        NotificationService.onNotificationOpenedApp((remoteMessage) => {
          console.log('Notification opened app:', remoteMessage);
          const notificationType = remoteMessage.data?.type;
          handleNotificationNavigation(notificationType);
        });

        // Check if app was opened by notification (killed → open tap)
        NotificationService.getInitialNotification((remoteMessage) => {
          console.log('App opened by notification:', remoteMessage);
          const notificationType = remoteMessage.data?.type;
          // Delay navigation until navigator is ready
          setTimeout(() => handleNotificationNavigation(notificationType), 1000);
        });

        // Listen for token refresh
        const unsubscribeTokenRefresh = NotificationService.onTokenRefresh(async (newToken) => {
          console.log('FCM token refreshed:', newToken);
          // Update token on server for seller
          const sellerToken = await AsyncStorage.getItem('sellerToken');
          if (sellerToken) {
            try {
              await axios.post(
                API_ENDPOINTS.SELLER_UPDATE_FCM_TOKEN || `${API_ENDPOINTS.SELLER_PROFILE}/update-fcm-token`,
                { fcmToken: newToken },
                {
                  headers: {
                    Authorization: `Bearer ${sellerToken}`,
                  },
                }
              );
            } catch (error) {
              console.error('Error updating refreshed FCM token:', error);
            }
          }
          // Update token on server for buyer
          const buyerToken = await AsyncStorage.getItem('buyerToken');
          if (buyerToken) {
            try {
              await axios.post(
                'https://upvcconnect.com/api/admin/buyers/update-fcm-token',
                { fcmToken: newToken },
                {
                  headers: {
                    Authorization: `Bearer ${buyerToken}`,
                  },
                }
              );
            } catch (error) {
              console.error('Error updating refreshed buyer FCM token:', error);
            }
          }
        });

        return () => {
          unsubscribeForeground();
          unsubscribeTokenRefresh();
        };
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };
  const toastConfig = {
    otpNotification: ({ props }) => (
      <View style={styles.toastContainer}>
        {/* <Text style={styles.toastTitle}>Your Premium OTP</Text> */}
        <Text style={styles.toastTitle}>
          Your verification code is: <Text style={styles.toastTitle}>{props.otp}</Text>
        </Text>
        <Text style={styles.toastTitle2}>{"redircting in 5 sec..."}</Text>
        <View style={styles.decorativeLine} />
      </View>
    )
  };

  const SuccessToast = ({ text1, text2 }) => (
    <View style={styles.successToast}>
      <LottieView
        // source={require('./assets/success.json')}
        autoPlay
        loop={false}
        style={{ width: 80, height: 80 }}
      />
      <Text style={styles.successTitle}>{text1}</Text>
      <Text style={styles.successMessage}>{text2}</Text>
    </View>
  );

  // Toast.configure({
  //   successFancy: (props) => <SuccessToast {...props} />
  // });

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
          {/* Toast should be rendered after your main content */}
          <Toast config={toastConfig} />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderLeftColor: 'black',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  toastTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign:"center"
  },
  toastTitle2: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign:"center"
  },
  toastMessage: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  otpText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 2,
  },
  decorativeLine: {
    height: 2,
    backgroundColor: 'white',
    width: '30%',
    alignSelf: 'center',
    marginTop: 8,
  },
  successToast: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 8
  },
  successMessage: {
    fontSize: 14,
    color: '#444'
  }
});