import React, { useState } from 'react';
import { View, Text, Keyboard, ActivityIndicator } from 'react-native';
import { styles } from './styles';
import { OtpInput } from "react-native-otp-entry";
import PrimaryButton from '../../components/UI/PrimaryButton';
import ResendTimer from '../../components/UI/ResendTimer';
import AppText from '../../components/AppText';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SellerOTPVerification = ({ route, navigation }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [showresend, setShowresend] = useState(true);
  const { mobileNumber } = route.params;

  const handleVerify = async (submittedOtp = otp) => {
    Keyboard.dismiss();
    if (submittedOtp.length !== 4) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: 'Please enter a 4-digit OTP',
        visibilityTime: 4000,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        'https://upvcconnect.com/api/sellers/verify-otp',
        {
          phoneNumber: mobileNumber,
          otp: submittedOtp
        }
      );

      await AsyncStorage.clear();
      if (response.data.token) {

        await AsyncStorage.setItem('sellerToken', response.data.token);
      }
      console.log("response.data.token otp verification : ", response?.data?.token)

      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Success',
        text2: response.data.message || 'OTP verified successfully',
        visibilityTime: 4000,
        onHide: () => {
          // if (response.data.isNewUser) {
          //   navigation.replace('WelcomeProfileSetup', { mobileNumber });
          // } else { 
          //   navigation.reset({
          //     index: 0,
          //     routes: [{ name: 'SellerMain' }],
          //   });

          // }
          if (response.data.isNewUser) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'WelcomeProfileSetup', params: { mobileNumber } }],
            });
          } else {
            // Go straight to main app — purchase restriction handled inside the app
            navigation.reset({
              index: 0,
              routes: [{ name: 'SellerMain' }],
            });
          }
        }
      });
      setShowresend(false) 
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed';
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

  const resendOtp = async () => {
    if (!canResend) return;

    try {
      setLoading(true);
      const response = await axios.post(
        'https://upvcconnect.com/api/sellers/send-otp',
        { phoneNumber: mobileNumber }
      );

      Toast.show({
        type: 'otpNotification',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
        props: {
          otp: response.data.otp,
        },
        onShow: () => console.log('New OTP sent'),
      });

      setOtp('');
      setCanResend(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
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

  const formattedPhone = mobileNumber ? `+91 ******${mobileNumber.slice(-3)}` : '';

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="black" />
        </View>
      )}

      <View style={loading ? styles.contentBlurred : styles.contentNormal}>
        <AppText weight='Inter' style={styles.title}>Verification code</AppText>
        <AppText weight='Inter' style={styles.subTitle1}>
          Enter the 4-digit code sent to
        </AppText>
        <AppText weight='Inter' style={styles.subTitle}>

          {formattedPhone}
        </AppText>

        <OtpInput
          numberOfDigits={4}
          focusColor="black"
          onTextChange={(text) => setOtp(text)}
          onFilled={(text) => {
            setOtp(text);
            handleVerify(text);
          }}
          theme={{
            containerStyle: styles.otpContainer,
            pinCodeContainerStyle: styles.pinCodeContainer,
            pinCodeTextStyle: styles.pinCodeText,
            focusStickStyle: styles.focusStick,
            focusedPinCodeContainerStyle: styles.activePinCodeContainer,
            filledPinCodeContainerStyle: styles.filledPinCodeContainer,
          }}
          autoFocus={true}
          hideStick={false}
          disabled={loading}
        /> 
        { showresend ? 
        <>
          <ResendTimer
            duration={30}
            canResend={canResend}
            onTimeout={() => setCanResend(true)}
          />
   
          <PrimaryButton
            title="Resend OTP"
            onPress={resendOtp}
            style={[
              styles.resendButton,
              (!canResend || loading) && styles.disabledButton
            ]}
            disabled={!canResend || loading}
          />
        </> : 
        <>

        </>
}
      </View>
    </View>
  );
};

export default SellerOTPVerification;

