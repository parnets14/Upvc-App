import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';

/**
 * Fallback component when video permissions are denied
 * Provides alternative ways for sellers to showcase their business
 * Addresses Google Play Store policy requirement 4.1 - graceful degradation
 */
const VideoFallback = ({ onPhotosSelected, onDescriptionSaved, userId = null }) => {
  const [businessDescription, setBusinessDescription] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const selectPhotos = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 5, // Allow multiple photos
      });

      if (!result.didCancel && !result.errorCode && result.assets?.length) {
        const photos = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type,
          fileName: asset.fileName || `business-photo-${Date.now()}.jpg`,
        }));
        
        setSelectedPhotos(photos);
        onPhotosSelected?.(photos);
        
        Alert.alert(
          'Photos Selected',
          `${photos.length} photo(s) selected for your business profile.`,
          [{ text: 'Great!', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error selecting photos:', error);
      Alert.alert('Error', 'Failed to select photos. Please try again.');
    }
  };

  const saveDescription = () => {
    if (businessDescription.trim().length < 50) {
      Alert.alert(
        'Description Too Short',
        'Please write at least 50 characters to help buyers understand your business.',
        [{ text: 'OK' }]
      );
      return;
    }

    onDescriptionSaved?.(businessDescription.trim());
    Alert.alert(
      'Description Saved',
      'Your business description has been saved to your profile.',
      [{ text: 'Great!', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="info" size={24} color="#FF9800" />
        <Text style={styles.headerTitle}>Alternative Business Showcase</Text>
      </View>

      <Text style={styles.description}>
        Since video upload isn't available, use these alternatives to showcase your business and attract buyers:
      </Text>

      {/* Photo Upload Option */}
      <View style={styles.optionCard}>
        <View style={styles.optionHeader}>
          <Icon name="photo-library" size={20} color="#4CAF50" />
          <Text style={styles.optionTitle}>Upload Business Photos</Text>
          <Text style={styles.effectivenessTag}>High Impact</Text>
        </View>
        
        <Text style={styles.optionDescription}>
          Upload up to 5 high-quality photos of your showroom, completed projects, or workshop.
        </Text>
        
        {selectedPhotos.length > 0 && (
          <View style={styles.selectedInfo}>
            <Icon name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.selectedText}>{selectedPhotos.length} photos selected</Text>
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.photoButton]}
          onPress={selectPhotos}
          disabled={isUploading}
        >
          <Icon name="add-photo-alternate" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>
            {selectedPhotos.length > 0 ? 'Change Photos' : 'Select Photos'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Business Description Option */}
      <View style={styles.optionCard}>
        <View style={styles.optionHeader}>
          <Icon name="description" size={20} color="#2196F3" />
          <Text style={styles.optionTitle}>Business Description</Text>
          <Text style={[styles.effectivenessTag, styles.mediumTag]}>Medium Impact</Text>
        </View>
        
        <Text style={styles.optionDescription}>
          Write a detailed description of your business, services, and what makes you unique.
        </Text>
        
        <TextInput
          style={styles.textInput}
          placeholder="Describe your UPVC business, experience, services, and what makes you stand out to buyers..."
          multiline
          numberOfLines={4}
          value={businessDescription}
          onChangeText={setBusinessDescription}
          maxLength={500}
        />
        
        <View style={styles.inputFooter}>
          <Text style={styles.characterCount}>
            {businessDescription.length}/500 characters
          </Text>
          <TouchableOpacity
            style={[
              styles.saveButton,
              businessDescription.trim().length < 50 && styles.saveButtonDisabled
            ]}
            onPress={saveDescription}
            disabled={businessDescription.trim().length < 50}
          >
            <Text style={styles.saveButtonText}>Save Description</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Additional Options */}
      <View style={styles.additionalOptions}>
        <Text style={styles.additionalTitle}>Other ways to build trust:</Text>
        <View style={styles.additionalItem}>
          <Icon name="verified" size={16} color="#4CAF50" />
          <Text style={styles.additionalText}>Upload GST certificate and business license</Text>
        </View>
        <View style={styles.additionalItem}>
          <Icon name="star-rate" size={16} color="#4CAF50" />
          <Text style={styles.additionalText}>Add customer testimonials and reviews</Text>
        </View>
        <View style={styles.additionalItem}>
          <Icon name="contact-phone" size={16} color="#4CAF50" />
          <Text style={styles.additionalText}>Provide detailed contact information</Text>
        </View>
      </View>

      {/* Video Upgrade Prompt */}
      <View style={styles.upgradePrompt}>
        <Icon name="videocam" size={20} color="#FF5722" />
        <Text style={styles.upgradeText}>
          Want 3x more leads? Enable video permissions to upload business videos.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  optionCard: {
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
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  effectivenessTag: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mediumTag: {
    backgroundColor: '#2196F3',
  },
  optionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedText: {
    fontSize: 13,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  photoButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 8,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  additionalOptions: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  additionalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  additionalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  additionalText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
  },
  upgradeText: {
    fontSize: 13,
    color: '#E65100',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
});

export default VideoFallback;