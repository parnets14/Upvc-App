
// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, BackHandler, Alert, Modal, StyleSheet, Dimensions } from 'react-native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { styles } from './styles';
// import WindowPrices from '../components/WindowPrices/WindowPrices';
// import WindowOptions from '../components/WindowOptions/WindowOptions';
// import WhiteVsColors from '../components/WhiteVsColors/WhiteVsColors';
// import TheProcess from '../components/TheProcess/TheProcess';
// import Price from '../components/Price/Price';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import AppText from '../../../components/AppText';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Toast from 'react-native-toast-message';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useFocusEffect } from '@react-navigation/native';

// const { width, height } = Dimensions.get('window');

// const HomeDashboard = ({ navigation }) => {
//   const [activeTab, setActiveTab] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [showLocationPrompt, setShowLocationPrompt] = useState(true);
//   const [buyerToken, setBuyerToken] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [showImagePopup, setShowImagePopup] = useState(false);
//   const [shouldPlayVideo, setShouldPlayVideo] = useState(false);

//   useEffect(() => {
//     AsyncStorage.getItem('buyerToken').then(token => {
//       setBuyerToken(token);
//     });
//   }, []);

//   const checkAndShowPopup = () => {
//     // Always show popup when location is selected and pause video
//     setShowImagePopup(true);
//     setShouldPlayVideo(false);
//   };

//   const handleClosePopup = () => {
//     setShowImagePopup(false);
//     setShouldPlayVideo(true); // Start video when popup is closed
//   };

//   const handleImageClick = () => {
//     setShowImagePopup(false);
//     setShouldPlayVideo(true);
//     navigation.navigate('BuyerInsights'); // Navigate to category/insights screen
//   };


//   useFocusEffect(
//     React.useCallback(() => {
//       const backAction = () => {
       
//         Alert.alert('Exit App', 'Are you sure you want to exit?', [
//           {
//             text: 'Cancel',
//             onPress: () => null,
//             style: 'cancel',
//           },
//           { text: 'YES', onPress: () => BackHandler.exitApp() },
//         ]);
//         return true; // Prevent default back behavior
//       };

//       const backHandler = BackHandler.addEventListener(
//         'hardwareBackPress',
//         backAction
//       );

//       return () => {
//         backHandler.remove();
//         // Pause video when leaving home screen (tab switch)
//         setShouldPlayVideo(false);
//       };
//     }, [])
//   );

//   // Pause video when navigating to any stack screen on top (notification, prices, etc.)
//   useFocusEffect(
//     React.useCallback(() => {
//       // Screen is focused — resume video if it was playing
//       // (only resumes if user had started it; default is false)
//       return () => {
//         // Screen lost focus for any reason — pause video
//         setShouldPlayVideo(false);
//       };
//     }, [])
//   );

//   const topCities = [
//     'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Ahmedabad',
//     'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
//     'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
//     'Patna', 'Vadodara', 'Ludhiana', 'Agra', 'Nashik',
//     'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Amritsar',
//   ];

//   const handleNotification = () => {
//     setShouldPlayVideo(false);
//     navigation.navigate('Notification');
//   };

//   useEffect(() => {
//     setActiveTab(null);
//   }, []);

//   useEffect(() => {
//     const getLocation = async () => {
//       const location = await AsyncStorage.getItem('userLocation');
//       setLocation(location)
//     }
//     getLocation()
//   }, []);

//   const tabs = ['PRICES', 'BUY NOW', 'WHITE vs COLORS', 'INSIGHTS'];

//   const onRefresh = () => {
//     setRefreshing(true);
//     // You can add any refresh logic here if needed
//     setTimeout(() => {
//       setRefreshing(false);
//     }, 1000);
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 0:
//         return <Price />;
//       case 1:
//         return (
//           <GestureHandlerRootView style={{ flex: 1 }}>
//             <WindowOptions />
//           </GestureHandlerRootView>
//         );
//       case 2:
//         return <WhiteVsColors />;
//       case 3:
//         return <TheProcess />;
//       case 4:
//         return <Price />;
//       default:
//         return <WindowPrices shouldPlayVideo={shouldPlayVideo} />;
//     }
//   };

//   const insets = useSafeAreaInsets();

//   const LocationPrompt = () => {
//     const handleSelectLocation = async (city) => {
//       await AsyncStorage.setItem('userLocation', city);
//       setLocation(city);
//       setShowLocationPrompt(false);
//       Toast.show({
//         type: 'success',
//         text1: 'Location Selected',
//         text2: `${city} has been set as your location.`,
//       });
//       // Show popup after location is selected
//       checkAndShowPopup();
//     };
 
//     if (!buyerToken) { 
//       return null;
//     }

//     return (
//       <View style={styles.promptContainer}>
//         <AppText style={styles.promptTitle}>Choose Your Location</AppText>

//         <View style={styles.cityWrap}>
//           {topCities.map((city, index) => (
//             <TouchableOpacity
//               key={index}
//               style={styles.cityButton}
//               onPress={() => handleSelectLocation(city)}
//             >
//               <AppText style={styles.cityText}>{city}</AppText>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <TouchableOpacity
//           style={styles.searchLocationBtn}
//           onPress={() => navigation.navigate('LocationSelection')}>
//           <AppText style={styles.searchLocationText}>Search Location</AppText>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <View style={{ paddingTop: insets.top, flex: 1, backgroundColor: 'white' }}>
//       {/* Image Popup Modal */}
//       <Modal
//         visible={showImagePopup}
//         transparent={true}
//         animationType="fade"
//         statusBarTranslucent={true}
//         hardwareAccelerated={true}
//         onRequestClose={handleClosePopup}>
//         <View style={popupStyles.modalOverlay}>
//           <View style={popupStyles.modalContent}>
//             <TouchableOpacity
//               style={popupStyles.closeIcon}
//               onPress={handleClosePopup}
//               activeOpacity={0.8}>
//               <MaterialIcons name="close" size={30} color="#fff" />
//             </TouchableOpacity>
//             <TouchableOpacity 
//               activeOpacity={0.9}
//               onPress={handleImageClick}
//               style={popupStyles.imageWrapper}>
//               <Image
//                 source={require('../../../assets/BuyerAddd.jpeg')}
//                 style={popupStyles.popupImage}
//                 resizeMode="contain"
//               />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {location === null && buyerToken !== null ? (
//         // Show only the location prompt
//         <LocationPrompt />
//       ) : (
//         // Show the full dashboard
//         <View style={styles.container}>
//           {/* Header */}
//           <View style={styles.header}>
//             <MaterialIcons />
//             <Image
//               source={require('../../../assets/logo.png')}
//               style={styles.logo}
//             />
//             <MaterialIcons
//               name="notifications-none"
//               size={24}
//               color="black"
//               onPress={handleNotification}
//             />
//           </View>

//           {/* Scrollable Tabs */}
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.tabScrollContainer}>
//             {tabs.map((tab, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[
//                   styles.tabButton,
//                   activeTab === index && styles.activeTab,
//                 ]}
//                 onPress={() => {
//                   setShouldPlayVideo(false);
//                   switch (index) {
//                     case 0:
//                       navigation.navigate('PricesScreen');
//                       break;
//                     case 1:
//                       navigation.navigate('BuyNowScreen');
//                       break;
//                     case 2:
//                       navigation.navigate('WhiteVsColorsScreen');
//                       break;
//                     case 3:
//                       navigation.navigate('ProcessScreen');
//                       break;
//                     default:
//                       break;
//                   }
//                 }}
//                 activeOpacity={0.7}>
//                 <AppText
//                   weight="SemiBold"
//                   style={[
//                     styles.tabText,
//                     activeTab === index && styles.activeTabText,
//                   ]}>
//                   {tab}
//                 </AppText>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>

//           {/* Main Content - Single ScrollView with RefreshControl */}
//           <ScrollView
//             contentContainerStyle={styles.scrollContent}
//             showsVerticalScrollIndicator={false}
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={onRefresh}
//                 colors={['#000000']}
//                 tintColor={'#000000'}
//               />
//             }>
//             {renderTabContent()}
//           </ScrollView>
//         </View>
//       )}
//     </View>
//   );
// };

// export default HomeDashboard;

// const popupStyles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 9999,
//     elevation: 9999,
//   },
//   modalContent: {
//     width: width * 0.9,
//     maxHeight: height * 0.8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     position: 'relative',
//     zIndex: 10000,
//     elevation: 10000,
//   },
//   closeIcon: {
//     position: 'absolute',
//     top: -50,
//     right: 10,
//     zIndex: 10001,
//     elevation: 10001,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   imageWrapper: {
//     width: '100%',
//     height: height * 0.7,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   popupImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 10,
//   },
// }); 
 
 
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, BackHandler, Alert, Modal, StyleSheet, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';
import WindowPrices from '../components/WindowPrices/WindowPrices';
import WindowOptions from '../components/WindowOptions/WindowOptions';
import WhiteVsColors from '../components/WhiteVsColors/WhiteVsColors';
import TheProcess from '../components/TheProcess/TheProcess';
import Price from '../components/Price/Price';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppText from '../../../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const HomeDashboard = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [location, setLocation] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [buyerToken, setBuyerToken] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [shouldPlayVideo, setShouldPlayVideo] = useState(false);

  // ✅ KEY FIX: useIsFocused gives a reliable boolean — false when any screen is on top
  const isFocused = useIsFocused();

  // ✅ When screen loses focus (navigation to any screen), stop the video immediately
  useEffect(() => {
    if (!isFocused) {
      setShouldPlayVideo(false);
    }
  }, [isFocused]);

  useEffect(() => {
    AsyncStorage.getItem('buyerToken').then(token => {
      setBuyerToken(token);
    });
  }, []);

  const checkAndShowPopup = () => {
    setShowImagePopup(true);
    setShouldPlayVideo(false);
  };

  const handleClosePopup = () => {
    setShowImagePopup(false);
    setShouldPlayVideo(true);
  };

  const handleImageClick = () => {
    setShowImagePopup(false);
    setShouldPlayVideo(false); // ✅ Stop before navigating
    navigation.navigate('BuyerInsights');
  };

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        Alert.alert('Exit App', 'Are you sure you want to exit?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          { text: 'YES', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => {
        backHandler.remove();
        // ✅ Pause video when screen loses focus for any reason
        setShouldPlayVideo(false);
      };
    }, [])
  );

  const topCities = [
    'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Ahmedabad',
    'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
    'Patna', 'Vadodara', 'Ludhiana', 'Agra', 'Nashik',
    'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Amritsar',
  ];

  const handleNotification = () => {
    setShouldPlayVideo(false); // ✅ Stop before navigating
    navigation.navigate('Notification');
  };

  useEffect(() => {
    setActiveTab(null);
  }, []);

  useEffect(() => {
    const getLocation = async () => {
      const location = await AsyncStorage.getItem('userLocation');
      setLocation(location);
    };
    getLocation();
  }, []);

  const tabs = ['PRICES', 'BUY NOW', 'WHITE vs COLORS', 'INSIGHTS'];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <Price />;
      case 1:
        return (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <WindowOptions />
          </GestureHandlerRootView>
        );
      case 2:
        return <WhiteVsColors />;
      case 3:
        return <TheProcess />;
      case 4:
        return <Price />;
      default:
        // ✅ Pass isFocused && shouldPlayVideo so video ONLY plays when screen is truly active
        return <WindowPrices shouldPlayVideo={isFocused && shouldPlayVideo} />;
    }
  };

  const insets = useSafeAreaInsets();

  const LocationPrompt = () => {
    const handleSelectLocation = async (city) => {
      await AsyncStorage.setItem('userLocation', city);
      setLocation(city);
      setShowLocationPrompt(false);
      Toast.show({
        type: 'success',
        text1: 'Location Selected',
        text2: `${city} has been set as your location.`,
      });
      checkAndShowPopup();
    };

    if (!buyerToken) {
      return null;
    }

    return (
      <View style={styles.promptContainer}>
        <AppText style={styles.promptTitle}>Choose Your Location</AppText>

        <View style={styles.cityWrap}>
          {topCities.map((city, index) => (
            <TouchableOpacity
              key={index}
              style={styles.cityButton}
              onPress={() => handleSelectLocation(city)}
            >
              <AppText style={styles.cityText}>{city}</AppText>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.searchLocationBtn}
          onPress={() => navigation.navigate('LocationSelection')}>
          <AppText style={styles.searchLocationText}>Search Location</AppText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ paddingTop: insets.top, flex: 1, backgroundColor: 'white' }}>
      {/* Image Popup Modal */}
      <Modal
        visible={showImagePopup}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        hardwareAccelerated={true}
        onRequestClose={handleClosePopup}>
        <View style={popupStyles.modalOverlay}>
          <View style={popupStyles.modalContent}>
            <TouchableOpacity
              style={popupStyles.closeIcon}
              onPress={handleClosePopup}
              activeOpacity={0.8}>
              <MaterialIcons name="close" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleImageClick}
              style={popupStyles.imageWrapper}>
              <Image
                source={require('../../../assets/BuyerAddd.jpeg')}
                style={popupStyles.popupImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {location === null && buyerToken !== null ? (
        <LocationPrompt />
      ) : (
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons />
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
            />
            <MaterialIcons
              name="notifications-none"
              size={24}
              color="black"
              onPress={handleNotification}
            />
          </View>

          {/* Scrollable Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContainer}>
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tabButton,
                  activeTab === index && styles.activeTab,
                ]}
                onPress={() => {
                  setShouldPlayVideo(false); // ✅ Always stop before navigating
                  switch (index) {
                    case 0:
                      navigation.navigate('PricesScreen');
                      break;
                    case 1:
                      navigation.navigate('BuyNowScreen');
                      break;
                    case 2:
                      navigation.navigate('WhiteVsColorsScreen');
                      break;
                    case 3:
                      navigation.navigate('ProcessScreen');
                      break;
                    default:
                      break;
                  }
                }}
                activeOpacity={0.7}>
                <AppText
                  weight="SemiBold"
                  style={[
                    styles.tabText,
                    activeTab === index && styles.activeTabText,
                  ]}>
                  {tab}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Main Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#000000']}
                tintColor={'#000000'}
              />
            }>
            {renderTabContent()}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default HomeDashboard;

const popupStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10000,
    elevation: 10000,
  },
  closeIcon: {
    position: 'absolute',
    top: -50,
    right: 10,
    zIndex: 10001,
    elevation: 10001,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 8,
  },
  imageWrapper: {
    width: '100%',
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
});
