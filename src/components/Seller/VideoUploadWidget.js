import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import VideoFallback from './VideoFallback';
import PermissionManager, { PermissionContext, PermissionStatus } from '../../utils/PermissionManager';
import AlternativeContentManager from '../../utils/AlternativeContentManager';

const VideoUploadWidget = ({ onVideoSelected, hasVideo, userId = null, onAlternativeContent }) => {
  const [showFallback, setShowFallback] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);

  const handleVideoPress = async () => {
    setIsCheckingPermissions(true);
    
    try {
      // With Android Photo Picker, no rationale needed - direct access
      await selectVideo();
    } catch (error) {
      console.error('Error handling video press:', error);
      Alert.alert('Error', 'Failed to access media. Please try again.');
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const handleFallbackPhotos = async (photos) => {
    try {
      const result = await AlternativeContentManager.uploadPhotoGallery(photos, userId);
      
      if (result.success) {
        Alert.alert(
          'Photos Uploaded!',
          `${photos.length} business photos uploaded successfully. This will help buyers see your work quality.`,
          [{ text: 'Great!', style: 'default' }]
        );
        
        onAlternativeContent?.({
          type: 'photos',
          content: result.photoUrls,
          effectiveness: result.effectiveness
        });
        
        setShowFallback(false);
      }
    } catch (error) {
      Alert.alert('Upload Error', error.message || 'Failed to upload photos');
    }
  };

  const handleFallbackDescription = async (description) => {
    try {
      const result = await AlternativeContentManager.createBusinessDescription(description, userId);
      
      if (result.success) {
        Alert.alert(
          'Description Saved!',
          'Your business description has been saved. This helps buyers understand your services.',
          [{ text: 'Great!', style: 'default' }]
        );
        
        onAlternativeContent?.({
          type: 'description',
          content: result.description,
          effectiveness: result.effectiveness
        });
        
        setShowFallback(false);
      }
    } catch (error) {
      Alert.alert('Save Error', error.message || 'Failed to save description');
    }
  };

  const handleDenialSettings = () => {
    setShowDenialImpact(false);
    PermissionManager.openAppSettings();
    PermissionManager.logPermissionRequest('video', PermissionContext.VIDEO_UPLOAD, 'settings_opened', userId);
  };

  const handleLearnMore = () => {
    Alert.alert(
      'Why Video Uploads Matter',
      'Business videos are the most effective way to:\n\n• Build trust with potential buyers\n• Showcase your work quality\n• Get 3x more qualified leads\n• Increase conversion rates by 60%\n\nUPVC Connect prioritizes sellers with videos in search results, giving you a competitive advantage.',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const selectVideo = async () => {
    try {
      // Using Android Photo Picker - no permissions needed
      // This addresses Google Play Store policy requirements
      await PermissionManager.logPermissionRequest(
        'video', 
        PermissionContext.VIDEO_UPLOAD, 
        'photo_picker_initiated', 
        userId
      );

      const result = await launchImageLibrary({
        mediaType: 'video',
        videoQuality: 'high',
        durationLimit: 60,
        selectionLimit: 1,
        // Use Android Photo Picker when available (Android 13+)
        presentationStyle: 'pageSheet',
      });
      
      if (!result.didCancel && !result.errorCode && result.assets?.length) {
        onVideoSelected(result.assets[0].uri);
        
        // Log successful video selection
        await PermissionManager.logPermissionRequest(
          'video', 
          PermissionContext.VIDEO_UPLOAD, 
          'video_selected_photo_picker', 
          userId
        );
      } else if (result.didCancel) {
        // Log that user cancelled video selection
        await PermissionManager.logPermissionRequest(
          'video', 
          PermissionContext.VIDEO_UPLOAD, 
          'video_selection_cancelled', 
          userId
        );
      }
    } catch (error) {
      console.log('Video selection error:', error);
      Alert.alert(
        'Error',
        'Failed to select video. Please try again.',
        [{ text: 'OK' }]
      );
      
      // Log the error
      await PermissionManager.logPermissionRequest(
        'video', 
        PermissionContext.VIDEO_UPLOAD, 
        'video_selection_error', 
        userId
      );
    }
  };

  return (
    <>
      {showFallback && (
        <View style={styles.fallbackOverlay}>
          <View style={styles.fallbackContainer}>
            <View style={styles.fallbackHeader}>
              <Text style={styles.fallbackTitle}>Alternative Business Showcase</Text>
              <TouchableOpacity 
                onPress={() => setShowFallback(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <VideoFallback
              onPhotosSelected={handleFallbackPhotos}
              onDescriptionSaved={handleFallbackDescription}
              userId={userId}
            />
          </View>
        </View>
      )}
      <TouchableOpacity 
        onPress={handleVideoPress} 
        activeOpacity={0.7}
        disabled={isCheckingPermissions}
      >
        <View style={styles.videoContainer}>
          {hasVideo ? (
            <>
              <Image
                source={{ uri: hasVideo }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>PRIORITY</Text>
              </View>
            </>
          ) : (
            <>
              <Icon name="videocam" size={40} color="#black" />
              <Text style={styles.videoText}>
                {isCheckingPermissions ? 'Checking permissions...' : 'Tap to upload video'}
              </Text>
              <Text style={styles.hintText}>60 seconds max • Required for seller activation</Text>
              <Text style={styles.benefitText}>Get 3x more qualified leads</Text>
              
              {/* Alternative options hint */}
              <TouchableOpacity 
                style={styles.alternativeHint}
                onPress={() => setShowFallback(true)}
              >
                <Icon name="photo-library" size={16} color="#666" />
                <Text style={styles.alternativeText}>Or use photos instead</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    height: 150,
    width: '100%',
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
  },
  videoText: {
    fontSize: 16,
    color: '#566573',
    marginTop: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 4,
  },
  benefitText: {
    fontSize: 11,
    color: '#27AE60',
    marginTop: 2,
    fontWeight: '600',
  },
  alternativeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  alternativeText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  fallbackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  fallbackContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '95%',
    maxHeight: '90%',
  },
  fallbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  priorityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F39C12',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default VideoUploadWidget;