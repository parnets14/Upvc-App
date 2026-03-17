import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from '../AppText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const SellerNotificationBell = ({ navigation }) => {
  const [rejectionCount, setRejectionCount] = useState(0);

  // Refresh count whenever the parent screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchRejectionCount();
    }, [])
  );

  const fetchRejectionCount = async () => {
    try {
      const token = await AsyncStorage.getItem('sellerToken');
      if (!token) return;

      const response = await axios.get('https://upvcconnect.com/api/sellers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const seller = response.data.seller;
        let count = 0;

        // Count rejected documents
        if (seller.gstCertificateStatus === 'rejected') count++;
        if (seller.visitingCardStatus === 'rejected') count++;
        if (seller.businessProfileVideoStatus === 'rejected') count++;

        setRejectionCount(count);
      }
    } catch (error) {
      console.error('Error fetching rejection count:', error);
    }
  };

  const handlePress = () => {
    navigation.navigate('SellerNotifications');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Icon name="notifications" size={28} color="#000" />
      {rejectionCount > 0 && (
        <View style={styles.badge}>
          <AppText weight="Inter" style={styles.badgeText}>
            {rejectionCount}
          </AppText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SellerNotificationBell;
