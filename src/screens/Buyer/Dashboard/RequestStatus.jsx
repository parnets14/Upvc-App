import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';
import PrimaryButton from '../../../components/UI/PrimaryButton';

const RequestStatus = ({ navigation }) => {
  // Mock data - replace with actual data from your backend

  const requestStatus = {
    sellersJoined: 6, // Changed to 6 to demonstrate the flow
    totalSellers: 6,
    remainingSlots: 0,
    lastUpdated: "Just now"
  };

  // Add this effect to auto-navigate when complete
  useEffect(() => {
    if (requestStatus.sellersJoined >= requestStatus.totalSellers) {
      navigation.replace('SellerQuotes');
    }
  }, [requestStatus.sellersJoined]);

  // const requestStatus = {
  //   sellersJoined: 3,
  //   totalSellers: 6,
  //   remainingSlots: 3,
  //   lastUpdated: "2 hours ago"
  // };

  const progressPercentage = (requestStatus.sellersJoined / requestStatus.totalSellers) * 100;

  return (
    <View style={styles.statusContainer}>
      <Text style={styles.statusHeader}>Your Quotes Are Coming!</Text>
      
      {/* Request Summary */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Buyer Request Summary</Text>
        <Text style={styles.statusText}>Sellers Joined: {requestStatus.sellersJoined}/{requestStatus.totalSellers}</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.statusNote}>{requestStatus.remainingSlots} slots left</Text>
      </View>

      {/* Preview Message */}
      <View style={styles.previewContainer}>
        <Text style={styles.previewText}>Sellers responding soon!</Text>
        <Text style={styles.lastUpdatedText}>Last updated: {requestStatus.lastUpdated}</Text>
      </View>

      {/* Action Buttons */}
      {/* <PrimaryButton
        title="Refresh"
        onPress={() => navigation.replace('RequestStatus')} // In real app, this would fetch fresh data
        style={styles.refreshButton}
      /> */}
      <PrimaryButton
        title="Refresh"
        onPress={() => {
          // In a real app, you would first check API status
          if (requestStatus.sellersJoined >= requestStatus.totalSellers) {
            navigation.replace('SellerQuotes');
          } else {
            navigation.replace('RequestStatus'); // Refresh current view
          }
        }}
        style={styles.refreshButton}
      />
      <PrimaryButton
        title="Back to Dashboard"
        onPress={() => navigation.goBack()}
        style={styles.secondaryButton}
        type="outline"
      />
    </View>
  );
};

export default RequestStatus;