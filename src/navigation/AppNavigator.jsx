import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Buyer Components
import SplashScreen from '../components/SplashScreen/SplashScreen';
import UserTypeSelection from '../components/UserTypeSelection/UserTypeSelection';
import BuyerOnboarding from '../screens/Buyer/Onboarding/BuyerOnboarding';
import OTPVerification from '../screens/Buyer/OTPVerification/OTPVerification';
import HomeDashboard from '../screens/Buyer/Dashboard/HomeDashboard';
import RequestStatus from '../screens/Buyer/Dashboard/RequestStatus';
import SellerQuotes from '../screens/Buyer/Dashboard/SellerResponses/SellerQuotes';
import ContactSellers from '../screens/Buyer/Dashboard/SellerResponses/ContactSellers';
import InsightsAndAds from '../screens/Buyer/Dashboard/InsightsAndAds';
import CategoriesListScreen from '../screens/Buyer/Dashboard/CategoriesListScreen';
import SubCategoriesScreen from '../screens/Buyer/Dashboard/SubCategoriesScreen';
import ActiveLeads from '../screens/Buyer/Dashboard/ActiveLeads';
// import BuyerAccountPage from '../screens/Buyer/BuyerAccountPage';
import BuyerAccountPage from '../screens/Buyer/Dashboard/BuyerAccountPage';

// Seller Components
import WelcomeProfileSetup from '../screens/Seller/WelcomeProfileSetup';
import PendingApproval from '../screens/Seller/PendingApproval';
import SellerOTPVerification from '../screens/Seller/OTPVerification';
import SellerDashboard from '../screens/Seller/SellerDashboard';
import LeadDetails from '../screens/Seller/LeadDetails';
import ContactBuyer from '../screens/Seller/ContactBuyer';
import MarketInsights from '../screens/Seller/MarketInsights';
import SellerAccountPage from '../screens/Seller/SellerAccountPage';
import SellerNotifications from '../screens/Seller/SellerNotifications';
import SellerBottomNav from '../screens/Seller/components/SellerBottomNav';
import BuyerBottomNav from '../screens/Buyer/components/BuyerBottomNav';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LoginScreen from '../screens/Buyer/Login/LoginScreen';
import OTPScreen from '../screens/Buyer/Login/OTPScreen';
import Notifications from '../screens/Buyer/Dashboard/Notifications';
import LocationSelectionScreen from '../screens/Buyer/Dashboard/LocationSelectionScreen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import QuoteRequestPage from '../screens/Buyer/components/QuoteRequestPage';
import SellerLoginScreen from '../screens/Seller/SellerLogin';
import Price from '../screens/Buyer/components/Price/Price';
import WhiteVsColors from '../screens/Buyer/components/WhiteVsColors/WhiteVsColors';
import TheProcess from '../screens/Buyer/components/TheProcess/TheProcess';
import WindowOptions from '../screens/Buyer/components/WindowOptions/WindowOptions';
import TopTabBar from '../screens/Buyer/Dashboard/TopTabBar';
import {useNavigation} from '@react-navigation/native';
import BuyerTopNav from '../screens/Buyer/components/BuyerTopNav';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Buyer Bottom Tab Navigator
function BuyerTabs() {
  const navigation = useNavigation();
  const iconName = 'account-search-outline';
  const activeIconName = 'account-search';
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Tab.Navigator
        tabBar={props => <BuyerBottomNav {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tab.Screen
          name="BuyerHome"
          component={HomeDashboard}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({color, size}) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="BuyerInsights"
          component={InsightsAndAds}
          options={{
            tabBarLabel: 'Category',
            tabBarIcon: ({color, size}) => (
              <FontAwesome name="bar-chart" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="ActiveLeads"
          component={ActiveLeads}
          options={{
            tabBarLabel: 'History',
            tabBarIcon: ({color, size}) => (
              <Ionicons name="ios-list-circle" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="BuyerAccount"
          component={BuyerAccountPage}
          options={{
            tabBarLabel: 'Account',
            tabBarIcon: ({color, size}) => (
              <MaterialIcons name="account-circle" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </GestureHandlerRootView>
  );
}

// Seller Bottom Tab Navigator
function SellerTabs() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Tab.Navigator
        tabBar={props => <SellerBottomNav {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tab.Screen name="LeadDetails" component={LeadDetails} />
        <Tab.Screen name="SellerDashboard" component={SellerDashboard} />
        <Tab.Screen name="MarketInsights" component={MarketInsights} />

        <Tab.Screen
          name="SellerAccount"
          component={SellerAccountPage}
          options={{
            tabBarLabel: 'Account',
            tabBarIcon: ({color, size}) => (
              <MaterialIcons name="account-circle" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </GestureHandlerRootView>
  );
}

const AppNavigator = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}>
        {/* Initial Screens */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="UserTypeSelection"
          component={UserTypeSelection}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        {/* Buyer Flow */}
        <Stack.Group
          screenOptions={{
            gestureEnabled: false,
          }}>
          <Stack.Screen name="BuyerOnboarding" component={BuyerOnboarding} />
          <Stack.Screen name="OTPVerification" component={OTPVerification} />
          <Stack.Screen name="Notification" component={Notifications} />
          <Stack.Screen
            name="LocationSelection"
            component={LocationSelectionScreen}
          />
          <Stack.Screen name="QuoteRequestPage" component={QuoteRequestPage} />
          <Stack.Screen name="WindowOptions" component={WindowOptions} />
        </Stack.Group>

        {/* Buyer Main App with Bottom Tabs */}
        <Stack.Screen
          name="BuyerMain"
          component={BuyerTabs}
          options={{gestureEnabled: false}}
        />

        {/* Buyer Sub-screens that should appear above tabs */}
        <Stack.Group>
          <Stack.Screen name="SubCategoriesScreen" component={SubCategoriesScreen} />
          <Stack.Screen name="SellerQuotes" component={SellerQuotes} />
          <Stack.Screen name="ContactSellers" component={ContactSellers} />
          <Stack.Screen name="RequestStatus" component={RequestStatus} />
          <Stack.Screen
            name="BuyerAccountPage"
            component={BuyerAccountPage}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
          <Stack.Screen name="PricesScreen" component={Price} />

          <Stack.Screen name="BuyNowScreen" component={WindowOptions} />

          <Stack.Screen name="WhiteVsColorsScreen" component={WhiteVsColors} />
          <Stack.Screen name="ProcessScreen" component={TheProcess} />
        </Stack.Group>

        {/* Seller Flow */}
        <Stack.Group
          screenOptions={{
            gestureEnabled: false,
          }}>
          <Stack.Screen
            name="WelcomeProfileSetup"
            component={WelcomeProfileSetup}
          />
          <Stack.Screen
            name="SellerLoginScreen"
            component={SellerLoginScreen}
          />
          <Stack.Screen
            name="SellerOTPVerification"
            component={SellerOTPVerification}
          />
          <Stack.Screen name="PendingApproval" component={PendingApproval} />
        </Stack.Group>

        {/* Seller Main App with Bottom Tabs */}
        <Stack.Screen
          name="SellerMain"
          component={SellerTabs}
          options={{gestureEnabled: false}}
        />

        {/* Seller Sub-screens that should appear above tabs */}
        <Stack.Group>
          <Stack.Screen name="SellerNotifications" component={SellerNotifications} />
          <Stack.Screen name="ContactBuyer" component={ContactBuyer} />
          <Stack.Screen
            name="SellerAccountPage"
            component={SellerAccountPage}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 0,
  },
});

export default AppNavigator;
