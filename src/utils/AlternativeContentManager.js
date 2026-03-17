import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

/**
 * Alternative Content Types
 */
export const ContentType = {
  PHOTO_GALLERY: 'photo_gallery',
  BUSINESS_DESCRIPTION: 'business_description',
  CONTACT_INFO: 'contact_info',
  CERTIFICATIONS: 'certifications'
};

/**
 * Content Effectiveness Ratings
 */
export const Effectiveness = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * Manages alternative content options when video is not available
 * Addresses Google Play Store policy requirements 5.1, 5.2, 5.3, 5.5
 */
class AlternativeContentManager {
  constructor() {
    this.uploadQueue = [];
  }

  /**
   * Upload multiple photos as video alternative
   * @param {Array} photos - Array of photo objects with uri, type, fileName
   * @param {string} userId - User ID for tracking
   * @returns {Promise<Object>} Upload result
   */
  async uploadPhotoGallery(photos, userId = null) {
    try {
      if (!photos || photos.length === 0) {
        throw new Error('No photos provided');
      }

      const token = await AsyncStorage.getItem('sellerToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      
      photos.forEach((photo, index) => {
        formData.append('businessPhotos', {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.fileName || `business-photo-${index}-${Date.now()}.jpg`,
        });
      });

      const response = await axios.post(
        'https://upvcconnect.com/api/sellers/business-photos',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.data.success) {
        // Store photo URLs locally for quick access
        await this.storeContentLocally('photos', response.data.photoUrls);
        
        return {
          success: true,
          photoUrls: response.data.photoUrls,
          message: `${photos.length} photos uploaded successfully`,
          contentType: ContentType.PHOTO_GALLERY,
          effectiveness: Effectiveness.HIGH
        };
      } else {
        throw new Error(response.data.message || 'Failed to upload photos');
      }
    } catch (error) {
      console.error('Error uploading photo gallery:', error);
      
      // Queue for retry if network error
      if (error.code === 'NETWORK_ERROR' || error.message.includes('timeout')) {
        await this.queueForRetry('photos', photos, userId);
      }
      
      throw error;
    }
  }

  /**
   * Save business description as video alternative
   * @param {string} description - Business description text
   * @param {string} userId - User ID for tracking
   * @returns {Promise<Object>} Save result
   */
  async createBusinessDescription(description, userId = null) {
    try {
      if (!description || description.trim().length < 50) {
        throw new Error('Description must be at least 50 characters');
      }

      const token = await AsyncStorage.getItem('sellerToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        'https://upvcconnect.com/api/sellers/business-description',
        {
          businessDescription: description.trim(),
          contentType: ContentType.BUSINESS_DESCRIPTION
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Store description locally
        await this.storeContentLocally('description', description.trim());
        
        return {
          success: true,
          description: description.trim(),
          message: 'Business description saved successfully',
          contentType: ContentType.BUSINESS_DESCRIPTION,
          effectiveness: Effectiveness.MEDIUM
        };
      } else {
        throw new Error(response.data.message || 'Failed to save description');
      }
    } catch (error) {
      console.error('Error saving business description:', error);
      
      // Store locally as fallback
      await this.storeContentLocally('description', description.trim());
      
      throw error;
    }
  }

  /**
   * Get alternative content suggestions based on current profile
   * @param {Object} currentProfile - Current seller profile data
   * @returns {Array} Array of alternative options
   */
  suggestAlternatives(currentProfile = {}) {
    const alternatives = [];

    // Photo gallery suggestion
    if (!currentProfile.businessPhotos || currentProfile.businessPhotos.length < 3) {
      alternatives.push({
        type: ContentType.PHOTO_GALLERY,
        title: 'Upload Business Photos',
        description: 'Add 3-5 high-quality photos of your showroom, completed projects, or workshop',
        effectiveness: Effectiveness.HIGH,
        priority: 1,
        icon: 'photo-library',
        estimatedImpact: '+60% buyer interest',
        timeRequired: '5 minutes'
      });
    }

    // Business description suggestion
    if (!currentProfile.businessDescription || currentProfile.businessDescription.length < 100) {
      alternatives.push({
        type: ContentType.BUSINESS_DESCRIPTION,
        title: 'Write Business Description',
        description: 'Describe your experience, services, and what makes you unique',
        effectiveness: Effectiveness.MEDIUM,
        priority: 2,
        icon: 'description',
        estimatedImpact: '+30% buyer confidence',
        timeRequired: '10 minutes'
      });
    }

    // Contact info suggestion
    if (!currentProfile.contactVerified) {
      alternatives.push({
        type: ContentType.CONTACT_INFO,
        title: 'Verify Contact Information',
        description: 'Add and verify your phone number, email, and business address',
        effectiveness: Effectiveness.MEDIUM,
        priority: 3,
        icon: 'contact-phone',
        estimatedImpact: '+25% buyer trust',
        timeRequired: '3 minutes'
      });
    }

    // Certifications suggestion
    if (!currentProfile.certifications || currentProfile.certifications.length === 0) {
      alternatives.push({
        type: ContentType.CERTIFICATIONS,
        title: 'Upload Certifications',
        description: 'Add GST certificate, business license, and quality certifications',
        effectiveness: Effectiveness.HIGH,
        priority: 4,
        icon: 'verified',
        estimatedImpact: '+40% buyer trust',
        timeRequired: '5 minutes'
      });
    }

    // Sort by priority and effectiveness
    return alternatives.sort((a, b) => {
      if (a.effectiveness === Effectiveness.HIGH && b.effectiveness !== Effectiveness.HIGH) return -1;
      if (b.effectiveness === Effectiveness.HIGH && a.effectiveness !== Effectiveness.HIGH) return 1;
      return a.priority - b.priority;
    });
  }

  /**
   * Calculate content completion score
   * @param {Object} profile - Seller profile data
   * @returns {number} Completion score (0-100)
   */
  calculateCompletionScore(profile = {}) {
    let score = 0;
    const maxScore = 100;

    // Video content (highest weight)
    if (profile.businessProfileVideo) {
      score += 40;
    } else {
      // Alternative content scoring
      if (profile.businessPhotos && profile.businessPhotos.length >= 3) {
        score += 25; // Photos are good alternative
      }
      if (profile.businessDescription && profile.businessDescription.length >= 100) {
        score += 15; // Description adds value
      }
    }

    // Contact information
    if (profile.contactVerified) {
      score += 20;
    }

    // Certifications
    if (profile.certifications && profile.certifications.length > 0) {
      score += 20;
    }

    // Basic profile info
    if (profile.businessName && profile.businessAddress) {
      score += 20;
    }

    return Math.min(score, maxScore);
  }

  /**
   * Store content locally for offline access
   * @param {string} type - Content type
   * @param {any} content - Content data
   */
  async storeContentLocally(type, content) {
    try {
      const key = `alternative_content_${type}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        content,
        timestamp: Date.now(),
        type
      }));
    } catch (error) {
      console.error('Error storing content locally:', error);
    }
  }

  /**
   * Get locally stored content
   * @param {string} type - Content type
   * @returns {Promise<any>} Stored content
   */
  async getLocalContent(type) {
    try {
      const key = `alternative_content_${type}`;
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting local content:', error);
      return null;
    }
  }

  /**
   * Queue content for retry upload
   * @param {string} type - Content type
   * @param {any} content - Content to retry
   * @param {string} userId - User ID
   */
  async queueForRetry(type, content, userId) {
    try {
      const retryItem = {
        type,
        content,
        userId,
        timestamp: Date.now(),
        retryCount: 0
      };
      
      this.uploadQueue.push(retryItem);
      
      // Store queue in AsyncStorage for persistence
      await AsyncStorage.setItem('upload_queue', JSON.stringify(this.uploadQueue));
    } catch (error) {
      console.error('Error queuing for retry:', error);
    }
  }

  /**
   * Process retry queue
   * @returns {Promise<Array>} Results of retry attempts
   */
  async processRetryQueue() {
    try {
      const results = [];
      
      for (const item of this.uploadQueue) {
        if (item.retryCount < 3) { // Max 3 retries
          try {
            let result;
            
            if (item.type === 'photos') {
              result = await this.uploadPhotoGallery(item.content, item.userId);
            } else if (item.type === 'description') {
              result = await this.createBusinessDescription(item.content, item.userId);
            }
            
            if (result.success) {
              // Remove from queue on success
              this.uploadQueue = this.uploadQueue.filter(queueItem => queueItem !== item);
              results.push({ success: true, item, result });
            }
          } catch (error) {
            item.retryCount++;
            results.push({ success: false, item, error: error.message });
          }
        }
      }
      
      // Update stored queue
      await AsyncStorage.setItem('upload_queue', JSON.stringify(this.uploadQueue));
      
      return results;
    } catch (error) {
      console.error('Error processing retry queue:', error);
      return [];
    }
  }

  /**
   * Get content effectiveness rating
   * @param {string} contentType - Type of content
   * @returns {string} Effectiveness rating
   */
  getContentEffectiveness(contentType) {
    const effectiveness = {
      [ContentType.PHOTO_GALLERY]: Effectiveness.HIGH,
      [ContentType.BUSINESS_DESCRIPTION]: Effectiveness.MEDIUM,
      [ContentType.CONTACT_INFO]: Effectiveness.MEDIUM,
      [ContentType.CERTIFICATIONS]: Effectiveness.HIGH
    };
    
    return effectiveness[contentType] || Effectiveness.LOW;
  }
}

// Export singleton instance
export default new AlternativeContentManager();