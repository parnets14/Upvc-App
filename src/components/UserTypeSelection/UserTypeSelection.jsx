import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from '../../components/AppText'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserTypeManager, { UserType } from '../../utils/UserTypeManager';
import PermissionManager, { PermissionContext } from '../../utils/PermissionManager';

const {width, height} = Dimensions.get('window');

// Responsive scaling functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const UserTypeSelection = () => {
  const navigation = useNavigation();
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const buttonScale = React.useRef(new Animated.Value(1)).current;
  const titlePosition = React.useRef(new Animated.Value(verticalScale(40))).current;
  const button1Position = React.useRef(new Animated.Value(width)).current;
  const button2Position = React.useRef(new Animated.Value(-width)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(titlePosition, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
      Animated.timing(button1Position, {
        toValue: 0,
        duration: 800,
        delay: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(button2Position, {
        toValue: 0,
        duration: 800,
        delay: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fadeAnim.setValue(0);
      titlePosition.setValue(verticalScale(40));
      button1Position.setValue(width);
      button2Position.setValue(-width);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(titlePosition, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
        Animated.timing(button1Position, {
          toValue: 0,
          duration: 800,
          delay: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(button2Position, {
          toValue: 0,
          duration: 800,
          delay: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, []),
  );

  const handlePress = async (screenName) => {
    if (isProcessingSelection) return;
    
    setIsProcessingSelection(true);
    
    try {
      // Determine user type based on selection
      const userType = screenName === 'SellerLoginScreen' ? UserType.SELLER : UserType.BUYER;
      
      // Set user type in UserTypeManager
      await UserTypeManager.setUserType(userType);
      
      // With Android Photo Picker, no permissions needed - proceed directly
      console.log(`${userType} selected - proceeding directly (no permissions needed)`);
      
      if (userType === UserType.BUYER) {
        await PermissionManager.logPermissionRequest(
          'video', 
          PermissionContext.VIDEO_UPLOAD, 
          'skipped_buyer_type', 
          'user_type_selection'
        );
      }
      
      navigateToScreen(screenName);
    } catch (error) {
      console.error('Error handling user type selection:', error);
      setIsProcessingSelection(false);
      // Fallback to original navigation
      navigateToScreen(screenName);
    }
  };

  const navigateToScreen = (screenName) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const animations = [
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titlePosition, {
          toValue: screenName === 'SellerLoginScreen' ? -verticalScale(40) : verticalScale(40),
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(button1Position, {
          toValue: screenName === 'SellerLoginScreen' ? width : -width,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(button2Position, {
          toValue: screenName === 'SellerLoginScreen' ? -width : width,
          duration: 500,
          useNativeDriver: true,
        }),
      ];
      Animated.parallel(animations).start(() => {
        setIsProcessingSelection(false);
        navigation.navigate(
          screenName === 'SellerLoginScreen'
            ? 'SellerLoginScreen'
            : 'LoginScreen',
        );
      });
    });
  };

  const checkToken = async () => {
    const buyerToken = await AsyncStorage.getItem('buyerToken');
    const sellerToken = await AsyncStorage.getItem('sellerToken');
    
    if (buyerToken) {
      navigation.navigate('BuyerMain');
    } else if (sellerToken) {
      navigation.navigate('SellerMain');
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.titleContainer,
            {opacity: fadeAnim, transform: [{translateY: titlePosition}]},
          ]}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <AppText 
            weight="Inter"
            style={styles.subtitle}
          >
            Your Premium Window to Better Deals
          </AppText>
        </Animated.View>

        <View style={styles.buttonContainer}>
          <Animated.View
            style={[
              styles.buttonWrapper,
              {transform: [{translateX: button1Position}]},
            ]}>
            <TouchableOpacity
              style={[styles.button, styles.blackButton]}
              onPress={() => handlePress('BuyerOnboarding')}
              activeOpacity={0.8}
              disabled={isProcessingSelection}>
              <Icon
                name="shopping-cart"
                size={moderateScale(26)}
                color="#FFF"
                style={styles.buttonIcon}
              />
              <AppText weight="Inter" style={styles.buttonText}>I'm a Buyer</AppText>
              <AppText weight="Inter" style={styles.buttonSubtext}>
                Browse premium UPVC products
              </AppText>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.buttonWrapper,
              {transform: [{translateX: button2Position}]},
            ]}>
            <TouchableOpacity
              style={[styles.button, styles.blackButton]}
              onPress={() => handlePress('SellerLoginScreen')}
              activeOpacity={0.8}
              disabled={isProcessingSelection}>
              <Icon
                name="store"
                size={moderateScale(26)}
                color="#FFF"
                style={styles.buttonIcon}
              /> 
              <AppText weight="Inter" style={styles.buttonText}>I'm a Seller</AppText>
              <AppText weight="Inter" style={styles.buttonSubtext}>
                Connect with real buyers
              </AppText>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.View style={[styles.footer, {opacity: fadeAnim}]}>
          <AppText weight="Inter" style={styles.footerText}>
            Trusted by 500+ businesses
          </AppText>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  overlay: {
    flex: 1,
    paddingHorizontal: moderateScale(25),
    justifyContent: 'space-between',
    paddingTop: verticalScale(Platform.OS === 'ios' ? 20 : 40),
    paddingBottom: verticalScale(20),
  },
  logo: {
    width: moderateScale(250),
    height: moderateScale(250),
    maxWidth: '80%',
    maxHeight: height * 0.3,
    alignSelf: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    flex: 0.4,
    justifyContent: 'center',
  },
  subtitle: { 
    color: '#333',
    textAlign: 'center',
    letterSpacing: 0.5,
    fontSize: moderateScale(16),
    marginTop: verticalScale(10),
    paddingHorizontal: moderateScale(20),
    lineHeight: moderateScale(22),
  },
  buttonContainer: {
    flex: 0.5,
    justifyContent: 'center',
    paddingHorizontal: moderateScale(10),
  },
  buttonWrapper: {
    marginBottom: verticalScale(20),
  },
  button: {
    width: '100%',
    borderRadius: moderateScale(14),
    borderWidth: moderateScale(1.2),
    paddingVertical: verticalScale(18),
    paddingHorizontal: moderateScale(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0, 
      height: moderateScale(5)
    },
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(6),
    elevation: 4,
    minHeight: verticalScale(100),
    justifyContent: 'center',
  },
  blackButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  buttonIcon: {
    marginBottom: verticalScale(8),
  },
  buttonText: { 
    color: '#FFF',
    marginBottom: verticalScale(4), 
    fontSize: moderateScale(20),
    textAlign: 'center',
  },
  buttonSubtext: {
    fontSize: moderateScale(14),
    color: '#FFF',
    textAlign: 'center',
    lineHeight: moderateScale(18),
  },
  footer: {
    alignItems: 'center',
    flex: 0.1,
    justifyContent: 'flex-end',
  },
  footerText: {
    color: '#888',
    fontSize: moderateScale(14),
  },
});

export default UserTypeSelection;