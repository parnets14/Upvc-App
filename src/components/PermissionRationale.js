import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PermissionManager, { PermissionContext } from '../utils/PermissionManager';

/**
 * Enhanced permission rationale dialog that appears BEFORE the Android permission popup.
 * This is required by Google Play Store policy to explain why the app needs the permission.
 * Now includes business-focused explanations and benefits to justify core functionality.
 */
const PermissionRationale = ({
  visible,
  onAllow,
  onCancel,
  onLearnMore,
  permissionType = 'video', // 'video' | 'photo' | 'camera'
  context = PermissionContext.VIDEO_UPLOAD,
  title,
  message,
  hideCancel = false, 
  directPermission = false,
}) => {
  const getDefaultContent = () => {
   
    if (permissionType === 'video' || permissionType === 'photo') {
      const baseContent = PermissionManager.getRationaleContent(context);
      
      // Add context-specific enhancements
      const contextEnhancements = getContextEnhancements(context);
      
      return {
        ...baseContent,
        ...contextEnhancements
      };
    }

    // Fallback for other permission types
    switch (permissionType) {
      case 'camera':
        return {
          title: 'Camera Access for Business Documentation',
          message: 'UPVC Connect needs camera access to capture photos of your business documents and products for your seller profile verification.',
          icon: 'camera-alt',
          benefits: [
            'Verify your business credentials',
            'Build buyer trust',
            'Complete seller registration',
            'Access all platform features'
          ],
          examples: 'Capture GST certificate, business license, visiting card, or product photos'
        };
      default:
        return {
          title: 'Permission Required',
          message: 'This permission is needed for the requested feature.',
          icon: 'security',
          benefits: [],
          examples: ''
        };
    }
  };

  const getContextEnhancements = (context) => {
    switch (context) {
      case PermissionContext.SELLER_ONBOARDING:
        return {
          urgency: 'high',
          ctaText: 'Complete Registration',
          additionalMessage: 'This is the final step to activate your seller account and start receiving leads.',
        };
      case PermissionContext.PROFILE_COMPLETION:
        return {
          urgency: 'medium',
          ctaText: 'Unlock Premium Features',
          additionalMessage: 'Complete your profile to access exclusive buyer requests in your area.',
        };
      case PermissionContext.VIDEO_UPLOAD:
        return {
          urgency: 'low',
          ctaText: 'Boost Your Business',
          additionalMessage: 'Join thousands of successful UPVC sellers who use videos to grow their business.',
        };
      default:
        return {
          urgency: 'low',
          ctaText: 'Continue',
          additionalMessage: '',
        };
    }
  };
  
  const content = getDefaultContent();
  const displayTitle = title || content.title;
  const displayMessage = message || content.message;
  
  const getIcon = () => {
    switch (permissionType) {
      case 'video':
        return 'videocam';
      case 'photo':
      case 'images':
        return 'photo-library';
      case 'camera':
        return 'camera-alt';
      default:
        return 'security';
    }
  };

  const handleCancel = () => {
    onCancel();
    // Show toast message when permission is denied
    Alert.alert(
      'Permission Not Allowed',
      'You need to allow video access to upload videos. Without this permission, you cannot upload videos to your profile.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Icon name={getIcon()} size={48} color="#4285F4" />
          </View>
          
          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.message}>{displayMessage}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.allowButton]}
              onPress={onAllow}
            >
              <Text style={styles.allowButtonText}>Allow</Text>
            </TouchableOpacity>
            
            {!hideCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Don't allow</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    width: '100%',
    maxWidth: 340,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#202124',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  message: {
    fontSize: 14,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allowButton: {
    backgroundColor: 'transparent',
  },
  allowButtonText: {
    color: '#1A73E8',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#1A73E8',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.25,
  },
});
export default PermissionRationale;


