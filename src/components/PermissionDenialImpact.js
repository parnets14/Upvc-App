import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PermissionContext } from '../utils/PermissionManager';

/**
 * Component to explain the impact of denying permissions on core functionality
 * Addresses Google Play Store policy requirement 2.4
 */
const PermissionDenialImpact = ({
  visible,
  onRetry,
  onCancel,
  onOpenSettings,
  permissionType = 'video',
  context = PermissionContext.VIDEO_UPLOAD,
}) => {
  const getImpactContent = () => {
    const baseContent = {
      video: {
        title: 'Video Permission Required for Core Features',
        impacts: [
          {
            feature: 'Seller Account Activation',
            impact: 'Cannot complete seller registration',
            severity: 'critical',
            icon: 'block'
          },
          {
            feature: 'Lead Generation',
            impact: 'Miss out on 3x more qualified leads',
            severity: 'high',
            icon: 'trending-down'
          },
          {
            feature: 'Business Showcase',
            impact: 'Cannot demonstrate work quality to buyers',
            severity: 'high',
            icon: 'visibility-off'
          },
          {
            feature: 'Competitive Advantage',
            impact: 'Lower ranking in buyer searches',
            severity: 'medium',
            icon: 'arrow-downward'
          }
        ],
        alternatives: [
          'Upload multiple high-quality photos instead',
          'Write detailed business description',
          'Add contact information and certifications'
        ]
      },
      photo: {
        title: 'Photo Permission Required for Verification',
        impacts: [
          {
            feature: 'Business Verification',
            impact: 'Cannot verify GST and business documents',
            severity: 'critical',
            icon: 'verified-user'
          },
          {
            feature: 'Buyer Trust',
            impact: 'Lower credibility with potential buyers',
            severity: 'high',
            icon: 'security'
          },
          {
            feature: 'Platform Access',
            impact: 'Limited access to premium features',
            severity: 'medium',
            icon: 'lock'
          }
        ],
        alternatives: [
          'Email documents to support team',
          'Complete verification later',
          'Use basic seller features only'
        ]
      }
    };

    return baseContent[permissionType] || baseContent.video;
  };

  const content = getImpactContent();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#FFC107';
      default: return '#9E9E9E';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'help';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Icon name="info" size={32} color="#FF9800" />
              <Text style={styles.title}>{content.title}</Text>
            </View>

            {/* Impact List */}
            <View style={styles.impactSection}>
              <Text style={styles.sectionTitle}>Impact on Your Business:</Text>
              {content.impacts.map((impact, index) => (
                <View key={index} style={styles.impactItem}>
                  <View style={styles.impactHeader}>
                    <Icon 
                      name={getSeverityIcon(impact.severity)} 
                      size={16} 
                      color={getSeverityColor(impact.severity)} 
                    />
                    <Text style={styles.featureName}>{impact.feature}</Text>
                  </View>
                  <View style={styles.impactContent}>
                    <Icon name={impact.icon} size={14} color="#666" />
                    <Text style={styles.impactText}>{impact.impact}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Alternatives */}
            <View style={styles.alternativesSection}>
              <Text style={styles.sectionTitle}>Alternative Options:</Text>
              {content.alternatives.map((alternative, index) => (
                <View key={index} style={styles.alternativeItem}>
                  <Icon name="check-circle" size={16} color="#4CAF50" />
                  <Text style={styles.alternativeText}>{alternative}</Text>
                </View>
              ))}
            </View>

            {/* Core Functionality Notice */}
            <View style={styles.coreNotice}>
              <Icon name="priority-high" size={20} color="#FF5722" />
              <Text style={styles.coreNoticeText}>
                {permissionType === 'video' 
                  ? 'Video uploads are essential for seller success on UPVC Connect. 85% of buyers prefer sellers with business videos.'
                  : 'Photo uploads are required for business verification and building buyer trust.'
                }
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Continue Without</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={onRetry}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.settingsButton]}
              onPress={onOpenSettings}
            >
              <Text style={styles.settingsButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  impactSection: {
    marginBottom: 20,
  },
  impactItem: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 6,
  },
  impactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 22,
  },
  impactText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  alternativesSection: {
    marginBottom: 20,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alternativeText: {
    fontSize: 13,
    color: '#444',
    marginLeft: 8,
    flex: 1,
  },
  coreNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  coreNoticeText: {
    fontSize: 13,
    color: '#D32F2F',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#007AFF',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: '#FF9800',
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default PermissionDenialImpact;