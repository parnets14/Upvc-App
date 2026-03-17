import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from './AppText';

const PremiumLoginModal = ({ visible, onClose, navigation, seller }) => {
  const scaleValue = new Animated.Value(0);
  const opacityValue = new Animated.Value(0);

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleLogin = () => {
    onClose();
    if (seller){
      navigation.navigate('SellerLoginScreen');
    } else{
      navigation.navigate('LoginScreen');
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityValue }]}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}>
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <Icon name="lock-outline" size={32} color="#000" />
            </View>
            <AppText weight='Inter' style={styles.title}>Authentication Required</AppText>
            <AppText weight='Inter' style={styles.message}>
              Please Login to Unlock this feature 
              {/* Sign in to access premium features */}
            </AppText>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onClose}
              >
                <AppText weight='Inter' style={styles.cancelButtonText}>NOT NOW</AppText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <AppText weight='Inter' style={styles.loginButtonText}>CONTINUE</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    color: '#000',
    fontSize: 20,
    // fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  message: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: 'rgba(0,0,0,0.8)',
    fontSize: 13, 
    letterSpacing: 2,
  },
  loginButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 13, 
    letterSpacing: 2,
  },
});

export default PremiumLoginModal;