/**
 * Image Picker Configuration
 * 
 * This configuration ensures compliance with Google Play Store policies
 * by using the Android Photo Picker (Android 13+) which doesn't require
 * READ_MEDIA_IMAGES or READ_MEDIA_VIDEO permissions.
 * 
 * For Android 12 and below, the picker will use the system gallery
 * with minimal permissions.
 */

/**
 * Get configuration for photo selection
 * @param {Object} options - Additional options to merge
 * @returns {Object} Image picker configuration
 */
export const getPhotoPickerConfig = (options = {}) => ({
  mediaType: 'photo',
  quality: 0.8,
  selectionLimit: 1,
  // Force use of Android Photo Picker (no permissions needed)
  presentationStyle: 'pageSheet',
  ...options,
});

/**
 * Get configuration for video selection
 * @param {Object} options - Additional options to merge
 * @returns {Object} Image picker configuration
 */
export const getVideoPickerConfig = (options = {}) => ({
  mediaType: 'video',
  videoQuality: 'high',
  durationLimit: 60,
  selectionLimit: 1,
  // Force use of Android Photo Picker (no permissions needed)
  presentationStyle: 'pageSheet',
  ...options,
});

/**
 * Get configuration for mixed media selection
 * @param {Object} options - Additional options to merge
 * @returns {Object} Image picker configuration
 */
export const getMixedMediaPickerConfig = (options = {}) => ({
  mediaType: 'mixed',
  quality: 0.8,
  selectionLimit: 1,
  // Force use of Android Photo Picker (no permissions needed)
  presentationStyle: 'pageSheet',
  ...options,
});
