import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PermissionManager, { PermissionContext, PermissionStatus } from '../../utils/PermissionManager';

/**
 * Permission Settings component for sellers to manage video/photo permissions
 * Addresses Google Play Store policy requirements 4.2, 4.3, 4.4, 4.5
 */
const PermissionSettings = ({ userId = null, onPermissionChange }) => {
  const [permissionStatus, setPermissionStatus] = useState(PermissionStatus.NOT_REQUESTED);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const status = await PermissionManager.getPermissionStatus();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking permission status:', error);
    }
  };

  const handleGrantPermissions = async () => {
    setIsLoading(true);
    
    try {
      // With Android Photo Picker, no rationale needed - direct access
      await requestPermissions();
    } catch (error) {
      console.error('Error handling grant permissions:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const granted = await PermissionManager.requestVideoPermissions(
        PermissionContext.PROFILE_COMPLETION,
        userId
      );
      
      if (granted) {
        setPermissionStatus(PermissionStatus.GRANTED);
        Alert.alert(
          'Permissions Granted!',
          'You can now upload business videos to get more qualified leads.',
          [{ text: 'Great!', style: 'default' }]
        );
        onPermissionChange?.(PermissionStatus.GRANTED);
      } else {
        const newStatus = await PermissionManager.getPermissionStatus();
        setPermissionStatus(newStatus);
        
        if (newStatus === PermissionStatus.NEVER_ASK_AGAIN) {
          showSettingsGuidance();
        }
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    }
  };

  const showSettingsGuidance = () => {
    Alert.alert(
      'Permission Required',
      'To upload business videos and get more leads, please enable video access in your device settings.\n\n1. Go to Settings\n2. Find UPVC Connect\n3. Enable Photos/Media permissions',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: () => {
            PermissionManager.openAppSettings();
            PermissionManager.logPermissionRequest('video', PermissionContext.PROFILE_COMPLETION, 'settings_opened', userId);
          }
        }
      ]
    );
  };

  const getStatusInfo = () => {
    switch (permissionStatus) {
      case PermissionStatus.GRANTED:
        return {
          icon: 'check-circle',
          color: '#4CAF50',
          title: 'Video Permissions Enabled',
          description: 'You can upload business videos to showcase your work and get more qualified leads.',
          actionText: 'Upload Video',
          actionColor: '#4CAF50'
        };
      case PermissionStatus.DENIED:
        return {
          icon: 'error',
          color: '#FF9800',
          title: 'Video Permissions Needed',
          description: 'Enable video access to upload business showcase videos and get 3x more qualified leads.',
          actionText: 'Grant Permissions',
          actionColor: '#007AFF'
        };
      case PermissionStatus.NEVER_ASK_AGAIN:
        return {
          icon: 'settings',
          color: '#F44336',
          title: 'Enable in Settings',
          description: 'Video permissions were permanently denied. Please enable them in device settings to upload business videos.',
          actionText: 'Open Settings',
          actionColor: '#F44336'
        };
      default:
        return {
          icon: 'video-call',
          color: '#666',
          title: 'Video Permissions Not Set',
          description: 'Grant video access to upload business showcase videos and attract more buyers.',
          actionText: 'Grant Permissions',
          actionColor: '#007AFF'
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleAction = () => {
    if (permissionStatus === PermissionStatus.NEVER_ASK_AGAIN) {
      showSettingsGuidance();
    } else if (permissionStatus === PermissionStatus.GRANTED) {
      // Navigate to video upload or trigger upload
      onPermissionChange?.(PermissionStatus.GRANTED);
    } else {
      handleGrantPermissions();
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon name="videocam" size={24} color="#333" />
          <Text style={styles.headerTitle}>Video Permissions</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Icon name={statusInfo.icon} size={32} color={statusInfo.color} />
            <View style={styles.statusText}>
              <Text style={styles.statusTitle}>{statusInfo.title}</Text>
              <Text style={styles.statusDescription}>{statusInfo.description}</Text>
            </View>
          </View>

          {/* Benefits section for non-granted states */}
          {permissionStatus !== PermissionStatus.GRANTED && (
            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>Why enable video permissions?</Text>
              <View style={styles.benefitItem}>
                <Icon name="trending-up" size={16} color="#4CAF50" />
                <Text style={styles.benefitText}>Get 3x more qualified leads</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="star" size={16} color="#4CAF50" />
                <Text style={styles.benefitText}>Higher buyer trust and conversion</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="priority-high" size={16} color="#4CAF50" />
                <Text style={styles.benefitText}>Priority placement in search results</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: statusInfo.actionColor }]}
            onPress={handleAction}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>
              {isLoading ? 'Processing...' : statusInfo.actionText}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Alternative options for denied permissions */}
        {permissionStatus !== PermissionStatus.GRANTED && (
          <View style={styles.alternativesCard}>
            <Text style={styles.alternativesTitle}>Alternative Options:</Text>
            <View style={styles.alternativeItem}>
              <Icon name="photo-library" size={16} color="#666" />
              <Text style={styles.alternativeText}>Upload multiple high-quality photos</Text>
            </View>
            <View style={styles.alternativeItem}>
              <Icon name="description" size={16} color="#666" />
              <Text style={styles.alternativeText}>Write detailed business description</Text>
            </View>
            <View style={styles.alternativeItem}>
              <Icon name="contact-phone" size={16} color="#666" />
              <Text style={styles.alternativeText}>Add contact information and certifications</Text>
            </View>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusText: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  benefitsSection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 13,
    color: '#444',
    marginLeft: 8,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  alternativesCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  alternativesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alternativeText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
});

export default PermissionSettings;