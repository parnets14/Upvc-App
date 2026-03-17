import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BuyerOnboarding from '../screens/Buyer/Onboarding/BuyerOnboarding';
import OTPVerification from '../screens/Buyer/OTPVerification/OTPVerification';
import BuyerDashboard from '../screens/Buyer/Dashboard/BuyerDashboard';

const Stack = createNativeStackNavigator();

const BuyerStack = () => {
  return (
    <></>
    // <Stack.Navigator
    //   initialRouteName="BuyerOnboarding"
    //   screenOptions={{
    //     headerShown: false,
    //     animation: 'slide_from_right',
    //   }}
    // >
    //   <Stack.Screen name="BuyerOnboarding" component={BuyerOnboarding} />
    //   <Stack.Screen name="OTPVerification" component={OTPVerification} />
    //   <Stack.Screen name="BuyerDashboard" component={BuyerDashboard} />
    // </Stack.Navigator>
  );
};

export default BuyerStack;