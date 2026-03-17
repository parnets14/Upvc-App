// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
// } from 'react-native';
// import Toast from 'react-native-toast-message';
// import AppText from '../../../components/AppText';
// import * as Animatable from 'react-native-animatable';
// import axios from 'axios';

// const LoginScreen = ({navigation}) => {
//   const [userName, setUserName] = useState('');
//   const [mobileNumber, setMobileNumber] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleProceed = async () => {
//     if (mobileNumber.length !== 10) return;

//     setIsLoading(true);

//     try {
//       const response = await axios.post(
//         'https://upvcconnect.com/api/auth/login',
//         {
//           name: userName,
//           mobileNumber,
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         },
//       );

//       console.log('data : ', response.data);

//       if (response.status === 200) { 
//         Toast.show({
//           type: 'otpNotification',
//           position: 'top',
//           visibilityTime: 5000,
//           autoHide: true,
//           props: {
//             otp: response.data.otp,
//           },
//           onShow: () => console.log('Toast shown'),
//           onHide: () =>
//             navigation.navigate('OTPVerification', {
//               mobileNumber,
//               userName,
//               token: response.data.token,
//               autootp: response.data.otp
//             }),
//         });
//       } else {
//         throw new Error(response.data.message || 'Failed to send OTP');
//       }
//     } catch (error) { 
//       const errorMessage = error.response?.data?.message || error.message;

//       Toast.show({
//         type: 'error',
//         position: 'top',
//         text1: 'Error',
//         text2: errorMessage,
//         visibilityTime: 4000,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSkip = () => {
//     navigation.navigate('BuyerMain');
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={styles.container}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} 
//     >
//       <ScrollView
//         contentContainerStyle={styles.scrollContainer}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}>
//         <Animatable.View
//           animation="fadeInDown"
//           duration={1000}
//           style={styles.titleContainer}>
//           <Image
//             source={require('../../../assets/logo.png')}
//             style={styles.logo}
//           />
//           <AppText weight="Inter" style={styles.subtitle}>
//             Your Premium Window to Better Deals
//           </AppText>
//         </Animatable.View>

//         <Animatable.View animation="fadeInUp" delay={300} duration={800}>
//           {/* User Name Input */}
//           <View style={styles.inputRow}>
//             <TextInput
//               style={[styles.input, {marginLeft: 4}]}
//               placeholder="Enter your name"
//               value={userName}
//               onChangeText={setUserName}
//               placeholderTextColor="#999"
//             />
//           </View>

//           {/* Mobile Number Input */}
//           <View style={styles.inputRow}>
//             <Image
//               source={require('../../../assets/Flag_of_India.svg.webp')}
//               style={styles.flag}
//             />
//             <Text style={styles.countryCode}>+91</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter mobile number"
//               keyboardType="phone-pad"
//               maxLength={10}
//               value={mobileNumber}
//               onChangeText={setMobileNumber}
//               placeholderTextColor="#999"
//             />
//           </View>

//           {mobileNumber.length === 10 && (
//             <TouchableOpacity
//               style={styles.button}
//               onPress={handleProceed}
//               disabled={isLoading}>
//               <AppText weight="Inter" style={styles.buttonText}>
//                 {isLoading ? 'Sending...' : 'Get OTP'}
//               </AppText>
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
//             <AppText weight="Inter" style={styles.skipButtonText}>
//               Skip
//             </AppText>
//           </TouchableOpacity>
//         </Animatable.View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   titleContainer: {
//     alignItems: 'center',
//     marginBottom: 25,
//   },
//   logo: {
//     width: 300,
//     height: 200,
//     resizeMode: 'contain',
//   },
//   subtitle: {
//     fontSize: 18,
//     color: '#333', 
//     textAlign: 'center',
//     letterSpacing: 0.3,
//   },
//   container: { 
//     backgroundColor: '#fff',
//     paddingHorizontal: 24,
//     flexDirection: 'column',
//     alignItems: 'center',
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     paddingBottom: 40,
//   },
//   inputRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderColor: '#ccc',
//     borderWidth: 0.5,
//     borderRadius: 10,
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//     marginBottom: 30,
//   },
//   flag: {
//     width: 24,
//     height: 16,
//     resizeMode: 'contain',
//     marginRight: 8,
//   },
//   countryCode: {
//     fontSize: 16,
//     color: '#000',
//     marginRight: 8,
//     borderRightWidth: 1,
//     paddingVertical: 10,
//     paddingRight: 10,
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     color: '#000',
//   },
//   button: {
//     backgroundColor: '#000',
//     paddingVertical: 14,
//     marginBottom: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   skipButton: {
//     backgroundColor: 'transparent',
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#000',
//   },
//   skipButtonText: {
//     color: '#000',
//     fontSize: 16,
//   },
// });

// export default LoginScreen;
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
  Dimensions, // ✨ Import Dimensions API
} from 'react-native';
import Toast from 'react-native-toast-message';
import AppText from '../../../components/AppText';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';

// --- Responsive Helpers ---
// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Create a scaling function for fonts, icons, and small UI elements
// We use a base width (e.g., an iPhone 8's width) to create a scaling factor
const guidelineBaseWidth = 375;
const scale = size => (width / guidelineBaseWidth) * size;

const LoginScreen = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // The component's logic (handleProceed, handleSkip) remains the same.
  // The changes are focused purely on the styles.
  const handleProceed = async () => {
    if (mobileNumber.length !== 10) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        'https://upvcconnect.com/api/auth/login',
        {
          mobileNumber,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('data : ', response.data);

      if (response.status === 200) {
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
            navigation.navigate('OTPVerification', {
              mobileNumber,
              token: response.data.token,
              autootp: response.data.otp,
            }),
        });
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;

      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: errorMessage,
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('BuyerMain');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animatable.View
          animation="fadeInDown"
          duration={1000}
          style={styles.titleContainer}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
          />
          <AppText weight="Inter" style={styles.subtitle}>
            Your Premium Window to Better Deals
          </AppText>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300} duration={800}>
          {/* Mobile Number Input */}
          <View style={styles.inputRow}>
            <Image
              source={require('../../../assets/Flag_of_India.svg.webp')}
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

          {mobileNumber.length === 10 && (
            <TouchableOpacity
              style={styles.button}
              onPress={handleProceed}
              disabled={isLoading}>
              <AppText weight="Inter" style={styles.buttonText}>
                {isLoading ? 'Sending...' : 'Get OTP'}
              </AppText>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <AppText weight="Inter" style={styles.skipButtonText}>
              Skip
            </AppText>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Responsive Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes up the full screen
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.06, // ✨ RESPONSIVE: Use screen width for padding
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Center content vertically
    paddingBottom: height * 0.05, // ✨ RESPONSIVE: Padding at the bottom
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: height * 0.04, // ✨ RESPONSIVE: Use screen height for margin
  },
  logo: {
    width: width * 0.8, // ✨ RESPONSIVE: Logo width as 80% of screen width
    height: undefined, // Let aspect ratio control the height
    aspectRatio: 3 / 2, // ✨ Maintain the original 300x200 aspect ratio
    resizeMode: 'contain',
  },
  subtitle: {
    fontSize: scale(16), // ✨ RESPONSIVE: Scaled font size
    color: '#333',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 0.5,
    borderRadius: 10,
    paddingVertical: height * 0.015, // ✨ RESPONSIVE: Vertical padding
    paddingHorizontal: width * 0.03, // ✨ RESPONSIVE: Horizontal padding
    marginBottom: height * 0.035, // ✨ RESPONSIVE: Margin
  },
  flag: {
    width: scale(24), // ✨ RESPONSIVE: Scaled icon size
    height: scale(16),
    resizeMode: 'contain',
    marginRight: width * 0.02,
  },
  countryCode: {
    fontSize: scale(15), // ✨ RESPONSIVE: Scaled font size
    color: '#000',
    marginRight: width * 0.02,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    paddingRight: width * 0.03,
  },
  input: {
    flex: 1,
    fontSize: scale(15), // ✨ RESPONSIVE: Scaled font size
    color: '#000',
    // The input text needs some vertical padding to feel centered on Android
    paddingVertical: 0,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: height * 0.018, // ✨ RESPONSIVE: Vertical padding
    marginBottom: height * 0.02, // ✨ RESPONSIVE: Margin
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: scale(15), // ✨ RESPONSIVE: Scaled font size
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: height * 0.018, // ✨ RESPONSIVE: Vertical padding
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  skipButtonText: {
    color: '#000',
    fontSize: scale(15), // ✨ RESPONSIVE: Scaled font size
  },
});

export default LoginScreen;
