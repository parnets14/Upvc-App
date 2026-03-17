import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { OtpInput } from "react-native-otp-entry";
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const OTPScreen = ({ route, navigation }) => {
  const { mobileNumber } = route.params;
  const [otp, setOtp] = useState('');
  const [resendTime, setResendTime] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    let timer;
    if (resendTime > 0) {
      timer = setTimeout(() => setResendTime(resendTime - 1), 1000)
    } else {
      setIsResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendTime]);

  const verifyOtp = (enteredOtp) => {
    setOtp(enteredOtp);
    if (enteredOtp.length === 6) {
      navigation.navigate('Home');
    }
  };

  const handleResendOtp = () => {
    setResendTime(30);
    setIsResendDisabled(true);
    console.log('Resending OTP to:', mobileNumber);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Verification</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>Sent to +91{mobileNumber}</Text>

        <View style={styles.otpContainer}>
          <OtpInput
            numberOfDigits={6}
            focusColor="#4A90E2"
            theme={{
              pinCodeContainerStyle: styles.pinCodeContainer,
              pinCodeTextStyle: styles.pinCodeText,
              focusedPinCodeContainerStyle: styles.focusedPinCode,
            }}
            onTextChange={verifyOtp}
          />
        </View>

        <View style={styles.resendContainer}>
          {isResendDisabled ? (
            <Text style={styles.resendText}>Resend code in {formatTime(resendTime)}</Text>
          ) : (
            <TouchableOpacity onPress={handleResendOtp}>
              <Text style={[styles.resendText, styles.resendLink]}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.button, otp.length !== 6 && styles.buttonDisabled]}
          disabled={otp.length !== 6}
          onPress={() => verifyOtp(otp)}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  otpContainer: {
    marginBottom: 32,
  },
  pinCodeContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: 60,
    width: 45,
  },
  pinCodeText: {
    color: '#333',
    fontSize: 20,
    fontWeight: '600',
  },
  focusedPinCode: {
    borderColor: '#4A90E2',
    backgroundColor: '#F5F9FF',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  resendLink: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowColor: 'transparent',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OTPScreen;