import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import AppText from '../../components/AppText';
import Toast from 'react-native-toast-message';
import axios from 'axios';

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    if (mobileNumber.length !== 10) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: 'Please enter a valid 10-digit mobile number',
        visibilityTime: 4000,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        'https://upvcconnect.com/api/sellers/send-otp',
        { phoneNumber: mobileNumber },
      );

      Toast.show({
        type: 'otpNotification',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
        props: {
          otp: response.data.otp,
        },
        onShow: () => console.log('Toast shown'),
        onHide: () =>
          navigation.navigate('SellerOTPVerification', {
            mobileNumber,
          }),
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to send OTP. Please try again.';
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: errorMessage,
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('SellerMain');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { minHeight: height }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
            />
          </View>
          <View style={styles.inputRow}>
            <Image
              source={require('../../assets/Flag_of_India.svg.webp')}
              style={styles.flag}
            />
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={handleProceed}
              disabled={loading}>
              <AppText weight="Inter" style={styles.buttonText}>
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <AppText weight="Inter" style={styles.skipButtonText}>
                Skip
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: 'white',
    paddingHorizontal: 24,
  },
  contentContainer: {
    // flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 0.5,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  flag: {
    width: 24,
    height: 16,
    resizeMode: 'contain',
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    color: '#000',
    marginRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    paddingVertical: 5,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 5,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 14,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  skipButtonText: {
    color: '#000',
    fontSize: 16,
  },
});

export default LoginScreen;