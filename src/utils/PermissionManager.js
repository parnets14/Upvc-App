import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserTypeManager, { UserType } from './UserTypeManager';

/**
 * Permission contexts for different use cases
 */
export const PermissionContext = {
  SELLER_ONBOARDING: 'seller_onboarding',
  VIDEO_UPLOAD: 'video_upload',
  PROFILE_COMPLETION: 'profile_completion',
  PHOTO_UPLOAD: 'photo_upload'
};

/**
 * Permission status enum
 */
export const PermissionStatus = {
  GRANTED: 'granted',
  DENIED: 'denied',
  NEVER_ASK_AGAIN: 'never_ask_again',
  NOT_REQUESTED: 'not_requested'
};

/**
 * Centralized Permission Manager using Android Photo Picker
 * Addresses Google Play Store policy requirements by eliminating media permissions
 * Uses Android Photo Picker for one-time media access as recommended by Google
 */
class PermissionManager {
  constructor() {
    this.permissionLogs = [];
  }

  /**
   * Check current video permissions status
   * Since we're using Photo Picker, permissions are always "granted"
   * @returns {Promise<string>} PermissionStatus
   */
  async checkVideoPermissions() {
    try {
      // Using Android Photo Picker - no permissions needed
      // This addresses Google Play Store policy requirements
      return PermissionStatus.GRANTED;
    } catch (error) {
      console.error('Error checking video permissions:', error);
      return PermissionStatus.GRANTED; // Photo picker doesn't require permissions
    }
  }

  /**
   * Check if permissions should be requested based on user type
   * With Photo Picker, no permissions are needed - but we still track user types
   * @returns {Promise<boolean>} Whether permissions should be requested
   */
  async shouldRequestPermissions() {
    const userType = await UserTypeManager.getUserType();
    
    // Only sellers need media access - buyers don't upload content
    // With Photo Picker, no actual permissions are requested
    return userType === UserType.SELLER;
  }

  /**
   * Request video permissions with user type validation
   * Using Android Photo Picker - no actual permissions needed
   * @param {string} context - PermissionContext
   * @param {string} userId - User ID for logging
   * @returns {Promise<boolean>} Whether permissions were granted
   */
  async requestVideoPermissionsConditional(context = PermissionContext.VIDEO_UPLOAD, userId = null) {
    try {
      // Check if user type allows media access
      const shouldRequest = await this.shouldRequestPermissions();
      
      if (!shouldRequest) {
        const userType = await UserTypeManager.getUserType();
        console.log(`Skipping media access for user type: ${userType}`);
        
        // Log that media access was skipped due to user type
        await this.logPermissionRequest('video', context, 'skipped_user_type', userId);
        
        // For buyers, return true since they don't need upload functionality
        return userType === UserType.BUYER;
      }

      // For sellers, using Photo Picker means no permissions needed
      return await this.requestVideoPermissions(context, userId);
    } catch (error) {
      console.error('Error in conditional permission request:', error);
      await this.logPermissionRequest('video', context, 'error', userId);
      return false;
    }
  }

  /**
   * Request video permissions for sellers
   * Using Android Photo Picker - no actual permissions needed
   * @param {string} context - PermissionContext
   * @param {string} userId - User ID for logging
   * @returns {Promise<boolean>} Whether permissions were granted
   */
  async requestVideoPermissions(context = PermissionContext.VIDEO_UPLOAD, userId = null) {
    try {
      // Log the permission request
      await this.logPermissionRequest('video', context, 'photo_picker_used', userId);

      // Using Android Photo Picker - no permissions needed
      // This addresses Google Play Store policy requirements
      console.log('Using Android Photo Picker - no permissions required');
      
      // Mark that user has granted permissions
      await this.markPermissionsGranted();
      
      return true; // Photo picker always works without permissions
    } catch (error) {
      console.error('Error with photo picker:', error);
      await this.logPermissionRequest('video', context, 'error', userId);
      return false;
    }
  }

  /**
   * Show settings alert when permissions are permanently denied
   * With Photo Picker, this should rarely be needed
   * @param {string} context - Permission context
   */
  showSettingsAlert(context) {
    const contextMessages = {
      [PermissionContext.SELLER_ONBOARDING]: {
        title: 'Media Access for Seller Account',
        message: 'To complete your seller registration and get priority leads, you need to upload a business video. We use Android Photo Picker for secure media access.',
      },
      [PermissionContext.VIDEO_UPLOAD]: {
        title: 'Media Access Required',
        message: 'Video uploads help you get 3x more qualified leads. We use Android Photo Picker for secure media access.',
      },
      [PermissionContext.PROFILE_COMPLETION]: {
        title: 'Complete Your Business Profile',
        message: 'A business video increases your lead conversion by 60%. We use Android Photo Picker for secure media access.',
      },
    };

    const content = contextMessages[context] || contextMessages[PermissionContext.VIDEO_UPLOAD];

    Alert.alert(
      content.title,
      content.message,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  }

  /**
   * Open app settings for manual permission grant
   */
  openAppSettings() {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }

  /**
   * Get current permission status without requesting
   * @returns {Promise<string>} PermissionStatus
   */
  async getPermissionStatus() {
    return await this.checkVideoPermissions();
  }

  /**
   * Check if user should see permission rationale
   * With Photo Picker, rationale is about media access, not permissions
   * @param {string} context - Permission context
   * @returns {Promise<boolean>} Whether to show rationale
   */
  async shouldShowRationale(context) {
    try {
      // Check if user has already granted permissions before
      const hasGrantedBefore = await AsyncStorage.getItem('media_access_granted_before');
      
      if (hasGrantedBefore === 'true') {
        // User has granted permissions before, don't show rationale again
        return false;
      }

      // First time - show rationale
      return true;
    } catch (error) {
      console.error('Error checking rationale status:', error);
      return true; // Default to showing rationale for safety
    }
  }

  /**
   * Log permission request for compliance tracking
   * @param {string} permissionType - 'video' | 'photo'
   * @param {string} context - PermissionContext
   * @param {string} result - 'photo_picker_used' | 'skipped_user_type' | 'error'
   * @param {string} userId - User ID
   */
  async logPermissionRequest(permissionType, context, result, userId = null) {
    try {
      const logEntry = {
        id: Date.now().toString(),
        userId: userId || 'anonymous',
        permissionType,
        context,
        result,
        method: 'android_photo_picker',
        timestamp: new Date().toISOString(),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      };

      // Store in memory for current session
      this.permissionLogs.push(logEntry);

      // Store in AsyncStorage for persistence
      const existingLogs = await AsyncStorage.getItem('permission_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(logEntry);

      // Keep only last 100 logs to prevent storage bloat
      const recentLogs = logs.slice(-100);
      await AsyncStorage.setItem('permission_logs', JSON.stringify(recentLogs));

      console.log('Media access logged:', logEntry);
    } catch (error) {
      console.error('Error logging media access:', error);
    }
  }

  /**
   * Get permission logs for compliance reporting
   * @returns {Promise<Array>} Permission logs
   */
  async getPermissionLogs() {
    try {
      const logs = await AsyncStorage.getItem('permission_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error retrieving permission logs:', error);
      return [];
    }
  }

  /**
   * Clear permission logs (for privacy compliance)
   */
  async clearPermissionLogs() {
    try {
      await AsyncStorage.removeItem('permission_logs');
      this.permissionLogs = [];
    } catch (error) {
      console.error('Error clearing permission logs:', error);
    }
  }

  /**
   * Get business-focused rationale message based on context
   * @param {string} context - PermissionContext
   * @returns {Object} Rationale content
   */
  getRationaleContent(context) {
    const contextContent = {
      [PermissionContext.SELLER_ONBOARDING]: {
        title: 'Video Required for Seller Account',
        message: 'UPVC Connect requires a business video to activate your seller account. Videos help buyers trust your business and give you 3x more qualified leads. We use Android Photo Picker for secure media access.',
        benefits: [
          '3x more qualified leads',
          'Higher buyer trust and conversion',
          'Priority placement in search results',
          'Required for seller account activation'
        ],
        examples: 'Show your showroom, completed installations, manufacturing process, or client testimonials'
      },
      [PermissionContext.VIDEO_UPLOAD]: {
        title: 'Media Access for Business Growth',
        message: 'Business videos are the #1 factor buyers use to choose UPVC fabricators. Sellers with videos get 60% higher lead conversion rates and premium lead priority. We use Android Photo Picker for secure access.',
        benefits: [
          '60% higher lead conversion',
          'Premium lead priority',
          'Builds buyer confidence',
          'Showcases your expertise'
        ],
        examples: 'Film your workshop, completed projects, quality certifications, or customer testimonials'
      },
      [PermissionContext.PROFILE_COMPLETION]: {
        title: 'Complete Your Business Profile',
        message: 'Your business profile is 80% complete. Add a video to unlock premium features and get priority access to high-value leads in your area. We use Android Photo Picker for secure access.',
        benefits: [
          'Unlock premium lead features',
          'Get priority in buyer searches',
          'Increase profile completion score',
          'Access to exclusive buyer requests'
        ],
        examples: 'Show your team at work, quality materials, or satisfied customers'
      },
      [PermissionContext.PHOTO_UPLOAD]: {
        title: 'Photo Access for Business Documentation',
        message: 'Upload photos of your GST certificate, visiting card, and business documents to verify your seller account and build buyer trust. We use Android Photo Picker for secure access.',
        benefits: [
          'Verify your business credentials',
          'Build buyer trust and confidence',
          'Complete seller registration',
          'Access to all platform features'
        ],
        examples: 'GST certificate, business license, visiting card, showroom photos'
      }
    };

    return contextContent[context] || contextContent[PermissionContext.VIDEO_UPLOAD];
  }

  /**
   * Request video permissions with retry mechanism
   * With Photo Picker, retries are not needed
   * @param {string} context - PermissionContext
   * @param {string} userId - User ID for logging
   * @param {number} retryCount - Current retry attempt
   * @returns {Promise<boolean>} Whether permissions were granted
   */
  async requestVideoPermissionsWithRetry(context = PermissionContext.VIDEO_UPLOAD, userId = null, retryCount = 0) {
    // With Photo Picker, no retries needed
    return await this.requestVideoPermissions(context, userId);
  }

  /**
   * Handle permission errors gracefully
   * @param {Error} error - The error that occurred
   * @param {string} context - Permission context
   * @param {string} userId - User ID
   */
  async handlePermissionError(error, context, userId = null) {
    console.error('Media access error:', error);
    
    await this.logPermissionRequest('video', context, 'error', userId);
    
    // Show user-friendly error message
    Alert.alert(
      'Media Access Error',
      'There was an issue accessing media. Please try again or contact support if the problem persists.',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  }

  /**
   * Check if user has already granted permissions before
   * With Photo Picker, this checks if user has used media access before
   * @returns {Promise<boolean>} Whether user has granted permissions before
   */
  async hasUserGrantedPermissionsBefore() {
    try {
      const key = 'media_access_granted_before';
      const hasGranted = await AsyncStorage.getItem(key);
      return hasGranted === 'true';
    } catch (error) {
      console.error('Error checking previous permission grants:', error);
      return false;
    }
  }

  /**
   * Mark that user has granted permissions
   * Called after successful media access
   */
  async markPermissionsGranted() {
    try {
      const key = 'media_access_granted_before';
      await AsyncStorage.setItem(key, 'true');
    } catch (error) {
      console.error('Error marking permissions as granted:', error);
    }
  }

  /**
   * Check app startup and avoid requesting permissions during initial load
   * Addresses Google Play Store policy requirement
   */
  async checkStartupPermissionPolicy() {
    try {
      const lastAppStart = await AsyncStorage.getItem('last_app_start');
      const currentTime = Date.now();
      
      // If app was started less than 5 seconds ago, don't request permissions
      if (lastAppStart && (currentTime - parseInt(lastAppStart)) < 5000) {
        console.log('Skipping media access - app just started');
        return false;
      }
      
      // Update last app start time
      await AsyncStorage.setItem('last_app_start', currentTime.toString());
      return true;
    } catch (error) {
      console.error('Error checking startup policy:', error);
      return true; // Default to allowing media access if check fails
    }
  }
}

// Export singleton instance
export default new PermissionManager();