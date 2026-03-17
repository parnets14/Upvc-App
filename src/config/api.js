import { Platform } from 'react-native';

/**
 * API Configuration
 * Automatically determines the correct API base URL based on environment
 */

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // Check if we're in development mode
  if (__DEV__) {
    // Development mode - use local server
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine's localhost
      return 'https://upvcconnect.com';
    } else if (Platform.OS === 'ios') {
      // iOS simulator can use localhost
      return 'http://localhost:5000';
    }
    // For physical devices, you'll need to use your computer's local IP
    // Uncomment and update the line below with your IP address:
    // return 'http://192.168.1.x:5000';
  }
  
  // Production mode - use production server
  return 'https://upvcconnect.com';
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  // Seller endpoints
  SELLER_REGISTER: `${API_BASE_URL}/api/sellers/register`,
  SELLER_PROFILE: `${API_BASE_URL}/api/sellers`,
  SELLER_UPDATE: `${API_BASE_URL}/api/sellers`,
  SELLER_BUSINESS_VIDEO: `${API_BASE_URL}/api/sellers/business-video`,
  SELLER_UPDATE_FCM_TOKEN: `${API_BASE_URL}/api/sellers/update-fcm-token`,
  
  // OTP endpoints
  SEND_OTP: `${API_BASE_URL}/api/sellers/send-otp`,
  VERIFY_OTP: `${API_BASE_URL}/api/sellers/verify-otp`,
  
  // Brands endpoint
  BRANDS_ALL: `${API_BASE_URL}/api/brands/all`,
  
  // Add other endpoints as needed
};

// Log the current API configuration (only in development)
if (__DEV__) {
  console.log('🌐 API Configuration:', {
    baseUrl: API_BASE_URL,
    platform: Platform.OS,
    isDevelopment: __DEV__
  });
}

export default API_ENDPOINTS;
