import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppText from '../../../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const Notifications = ({navigate}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const buyerToken = await AsyncStorage.getItem('buyerToken');
      if (!buyerToken) {
        console.log('No buyer token found');
        setLoading(false);
        return;
      }

      console.log('📥 Fetching buyer notifications...');
      const response = await axios.get(
        'https://upvcconnect.com/api/admin/notifications/buyer',
        {
          headers: {
            Authorization: `Bearer ${buyerToken}`,
          },
        }
      );

      console.log('📬 Notifications response:', response.data);
      if (response.data.success) {
        console.log(`✅ Loaded ${response.data.notifications.length} notifications`);
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getIconForNotification = (notification) => {
    // Default icon for admin notifications
    if (notification.type === 'admin_notification') {
      return 'notifications-active';
    }
    // You can add more types here
    return 'notifications';
  };

  return (
    <View style={{paddingTop: insets.top, flex: 1, backgroundColor: 'white'}}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { navigation.goBack() }}>
            <MaterialIcons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
          /> 
          <View style={styles.placeholder} />  
        </View>

        {/* Notification List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <AppText weight='Inter' style={styles.loadingText}>Loading notifications...</AppText>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="notifications-none" size={50} color="#A0A0A0" />
                <AppText weight='Bold' style={styles.emptyText}>No notifications yet</AppText>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification._id}
                  style={styles.notificationCard}
                  onPress={() => { /* Handle notification tap */ }}
                >
                  <View style={styles.iconContainer}>
                    <MaterialIcons name={getIconForNotification(notification)} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.notificationContent}>
                    <AppText weight='SemiBold' style={styles.notificationTitle}>{notification.title}</AppText>
                    <AppText weight='SemiBold' style={styles.notificationMessage}>{notification.message}</AppText>
                    <AppText weight='Inter' style={styles.notificationTime}>{getTimeAgo(notification.createdAt)}</AppText>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#FFFFFF', 
  },
  logo: {
    // marginTop:15,
    // alignSelf:"center",
    width: 100, 
    height: 50,  
    // resizeMode: 'contain', 
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, 
  },
  headerTitle: {
    fontSize: width * 0.06, 
    color: '#000000',  
    letterSpacing: 1,
  },
  placeholder: {
    width: 24, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.3,
  },
  loadingText: {
    fontSize: width * 0.04,
    color: '#666666',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.2,
  },
  emptyText: {
    fontSize: width * 0.04,
    color: '#A0A0A0', 
    marginTop: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginVertical: 8,
    backgroundColor: '#F8F8F8', 
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: width * 0.04, 
    color: '#000000', 
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: width * 0.035,
    color: '#333333', 
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: width * 0.03,
    color: '#A0A0A0', 
    marginTop: 5,
  },
});

export default Notifications;