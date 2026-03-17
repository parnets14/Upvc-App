/**
 * URL Helper Functions
 * Fixes duplicated URLs and ensures proper video URL formatting
 */

/**
 * Cleans duplicated base URLs from video URLs and handles relative paths
 * @param {string} url - The URL to clean
 * @returns {string} - The cleaned URL
 */
export const cleanVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  const baseUrl = 'https://upvcconnect.com';
  
  // Handle relative paths (convert to absolute)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Remove leading slash if present
    const cleanPath = url.replace(/^\/+/, '');
    const absoluteUrl = `${baseUrl}/${cleanPath}`;
    console.log('🔧 Converting relative to absolute URL:', url, '→', absoluteUrl);
    return absoluteUrl;
  }
  
  // Fix duplicated base URLs
  const duplicatedPattern = `${baseUrl}/${baseUrl}/`;
  
  if (url.includes(duplicatedPattern)) {
    // Remove the first occurrence of base URL
    console.log('🔧 Fixing duplicated URL:', url);
    const cleanedUrl = url.replace(`${baseUrl}/`, '');
    console.log('✅ Cleaned URL:', cleanedUrl);
    return cleanedUrl;
  }
  
  return url;
};

/**
 * Cleans image/logo URLs - handles both absolute and relative paths
 * @param {string} url - The URL to clean
 * @returns {string} - The cleaned URL
 */
export const cleanImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  const baseUrl = 'https://upvcconnect.com';
  
  // If already absolute URL, just clean any duplicates
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return cleanVideoUrl(url);
  }
  
  // Handle relative paths
  const cleanPath = url.replace(/^\/+/, '');
  const absoluteUrl = `${baseUrl}/${cleanPath}`;
  console.log('🖼️ Converting relative image to absolute URL:', url, '→', absoluteUrl);
  return absoluteUrl;
};

/**
 * Ensures URL has proper base URL prefix
 * @param {string} url - The URL to process
 * @returns {string} - The properly formatted URL
 */
export const ensureAbsoluteUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // First clean any duplicated URLs
  const cleaned = cleanVideoUrl(url);
  
  // If it's already absolute, return as is
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return cleaned;
  }
  
  // Add base URL if it's a relative path
  const baseUrl = 'https://upvcconnect.com';
  const cleanPath = cleaned.replace(/^\/+/, '');
  return `${baseUrl}/${cleanPath}`;
};

/**
 * Recursively cleans all video URLs in an object or array
 * @param {any} data - The data to clean
 * @returns {any} - The cleaned data
 */
export const cleanAllVideoUrls = (data) => {
  if (typeof data === 'string') {
    // Check if it looks like a video URL or file path
    if (data.includes('uploads/') || data.includes('.mp4') || data.includes('.mov') || data.includes('video')) {
      return cleanVideoUrl(data);
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(cleanAllVideoUrls);
  }
  
  if (data && typeof data === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      // Clean video-related fields
      if (key.toLowerCase().includes('video') || key.toLowerCase().includes('url')) {
        cleaned[key] = cleanVideoUrl(value);
      } else {
        cleaned[key] = cleanAllVideoUrls(value);
      }
    }
    return cleaned;
  }
  
  return data;
};