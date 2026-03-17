import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * User types in the UPVC Connect app
 */
export const UserType = {
  SELLER: 'seller',
  BUYER: 'buyer',
  UNKNOWN: 'unknown'
};

/**
 * Manages user type detection and storage for conditional permission handling
 */
class UserTypeManager {
  constructor() {
    this.currentUserType = UserType.UNKNOWN;
  }

  /**
   * Set the current user type
   * @param {string} userType - UserType enum value
   */
  async setUserType(userType) {
    try {
      this.currentUserType = userType;
      await AsyncStorage.setItem('user_type', userType);
      console.log('User type set to:', userType);
    } catch (error) {
      console.error('Error setting user type:', error);
    }
  }

  /**
   * Get the current user type
   * @returns {Promise<string>} UserType enum value
   */
  async getUserType() {
    try {
      if (this.currentUserType !== UserType.UNKNOWN) {
        return this.currentUserType;
      }

      const storedType = await AsyncStorage.getItem('user_type');
      if (storedType) {
        this.currentUserType = storedType;
        return storedType;
      }

      // Try to detect from stored tokens
      const sellerToken = await AsyncStorage.getItem('sellerToken');
      const buyerToken = await AsyncStorage.getItem('buyerToken');

      if (sellerToken) {
        this.currentUserType = UserType.SELLER;
        await this.setUserType(UserType.SELLER);
        return UserType.SELLER;
      }

      if (buyerToken) {
        this.currentUserType = UserType.BUYER;
        await this.setUserType(UserType.BUYER);
        return UserType.BUYER;
      }

      return UserType.UNKNOWN;
    } catch (error) {
      console.error('Error getting user type:', error);
      return UserType.UNKNOWN;
    }
  }

  /**
   * Check if current user is a seller
   * @returns {Promise<boolean>}
   */
  async isSeller() {
    const userType = await this.getUserType();
    return userType === UserType.SELLER;
  }

  /**
   * Check if current user is a buyer
   * @returns {Promise<boolean>}
   */
  async isBuyer() {
    const userType = await this.getUserType();
    return userType === UserType.BUYER;
  }

  /**
   * Check if user type is unknown/not set
   * @returns {Promise<boolean>}
   */
  async isUnknown() {
    const userType = await this.getUserType();
    return userType === UserType.UNKNOWN;
  }

  /**
   * Clear user type (for logout)
   */
  async clearUserType() {
    try {
      this.currentUserType = UserType.UNKNOWN;
      await AsyncStorage.removeItem('user_type');
    } catch (error) {
      console.error('Error clearing user type:', error);
    }
  }

  /**
   * Check if video permissions should be requested for current user type
   * @returns {Promise<boolean>}
   */
  async shouldRequestVideoPermissions() {
    const userType = await this.getUserType();
    
    // Only sellers need video permissions for business videos
    // Buyers don't need video permissions as they only view content
    return userType === UserType.SELLER;
  }

  /**
   * Get user-specific permission context
   * @returns {Promise<string>} Permission context based on user type
   */
  async getPermissionContext() {
    const userType = await this.getUserType();
    
    switch (userType) {
      case UserType.SELLER:
        return 'seller_video_upload';
      case UserType.BUYER:
        return 'buyer_content_view';
      default:
        return 'unknown_user';
    }
  }
}

// Export singleton instance
export default new UserTypeManager();