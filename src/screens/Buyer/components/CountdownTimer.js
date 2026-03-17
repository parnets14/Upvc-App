import React, { useState, useEffect, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../../../components/AppText';

const CountdownTimer = ({ createdAt }) => {
  const calculateTimeLeft = () => { 
    const expiryTime = new Date(createdAt).getTime() + 48 * 60 * 60 * 1000;
    const difference = expiryTime - new Date().getTime();

    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { hours: 0, minutes: 0, seconds: 0 };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt]);

  const formatTime = (time) => String(time).padStart(2, '0');

  // Don't render if the time is up
  if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return (
      <View style={styles.expiredContainer}>
        <AppText weight="SemiBold" style={styles.expiredText}>Lead Expired</AppText>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.compactContainer}>
        <AppText weight="SemiBold" style={styles.compactTitle}>Expires In</AppText>
        
        {/* Timer and labels in a single row */}
        <View style={styles.compactRow}>
          {/* Hours */}
          <View style={styles.compactTimeUnit}>
            <AppText weight="Bold" style={styles.compactTimeText}>{formatTime(timeLeft.hours)}</AppText>
            <AppText weight="Medium" style={styles.compactUnitLabel}>HRS</AppText>
          </View>
          
          <AppText weight="Bold" style={styles.compactSeparator}>:</AppText>
          
          {/* Minutes */}
          <View style={styles.compactTimeUnit}>
            <AppText weight="Bold" style={styles.compactTimeText}>{formatTime(timeLeft.minutes)}</AppText>
            <AppText weight="Medium" style={styles.compactUnitLabel}>MINS</AppText>
          </View>
          
          <AppText weight="Bold" style={styles.compactSeparator}>:</AppText>
          
          {/* Seconds */}
          <View style={styles.compactTimeUnit}>
            <AppText weight="Bold" style={styles.compactTimeText}>{formatTime(timeLeft.seconds)}</AppText>
            <AppText weight="Medium" style={styles.compactUnitLabel}>SECS</AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Outer container to center everything
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  compactTitle: {
    fontSize: 18,
    color: '#000000',
    marginRight: 10,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactTimeUnit: {
    alignItems: 'center',
    minWidth: 30,
  },
  compactTimeText: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '700',
  },
  compactUnitLabel: {
    fontSize: 12,
    color: '#000000',
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  compactSeparator: {
    fontSize: 16,
    color: '#000000',
    marginHorizontal: 4,
    fontWeight: 'bold',
  },
  expiredContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiredText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
});

export default memo(CountdownTimer);