import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PermissionManager, { PermissionStatus } from '../utils/PermissionManager';

/**
 * Permission Status Indicator component that reflects current permission state
 * Addresses Google Play Store policy requirement 4.5 - UI reflects permission status
 */
const PermissionStatusIndicator = ({ 
  onPress, 
  showText = true, 
  size = 'medium',
  userId = null 
}) => {
  const [permissionStatus, setPermissionStatus] = useState(PermissionStatus.NOT_REQUESTED);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermissionStatus();
    
    // Set up interval to check permission status periodically
    const interval = setInterval(checkPermissionStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const status = await PermissionManager.getPermissionStatus();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking permission status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = () => {
    switch (permissionStatus) {
      case PermissionStatus.GRANTED:
        return {
          icon: 'check-circle',
          color: '#4CAF50',
          backgroundColor: '#E8F5E8',
          text: 'Video Enabled',
          shortText: 'Enabled'
        };
      case PermissionStatus.DENIED:
        return {
          icon: 'warning',
          color: '#FF9800',
          backgroundColor: '#FFF3E0',
          text: 'Permission Needed',
          shortText: 'Denied'
        };
      case PermissionStatus.NEVER_ASK_AGAIN:
        return {
          icon: 'settings',
          color: '#F44336',
          backgroundColor: '#FFEBEE',
          text: 'Enable in Settings',
          shortText: 'Blocked'
        };
      default:
        return {
          icon: 'video-call',
          color: '#666',
          backgroundColor: '#f5f5f5',
          text: 'Grant Video Access',
          shortText: 'Not Set'
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          containerPadding: 6,
          iconSize: 16,
          fontSize: 11,
          borderRadius: 6
        };
      case 'large':
        return {
          containerPadding: 12,
          iconSize: 24,
          fontSize: 16,
          borderRadius: 10
        };
      default: // medium
        return {
          containerPadding: 8,
          iconSize: 20,
          fontSize: 13,
          borderRadius: 8
        };
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: '#f5f5f5' }]}>
        <Icon name="hourglass-empty" size={16} color="#666" />
        {showText && <Text style={styles.loadingText}>Checking...</Text>}
      </View>
    );
  }

  const statusConfig = getStatusConfig();
  const sizeConfig = getSizeConfig();

  const containerStyle = [
    styles.container,
    {
      backgroundColor: statusConfig.backgroundColor,
      padding: sizeConfig.containerPadding,
      borderRadius: sizeConfig.borderRadius,
    }
  ];

  const textStyle = [
    styles.text,
    {
      color: statusConfig.color,
      fontSize: sizeConfig.fontSize,
    }
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <Icon 
        name={statusConfig.icon} 
        size={sizeConfig.iconSize} 
        color={statusConfig.color} 
      />
      {showText && (
        <Text style={textStyle}>
          {size === 'small' ? statusConfig.shortText : statusConfig.text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    marginLeft: 6,
    fontWeight: '500',
  },
  loadingText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
});

export default PermissionStatusIndicator;