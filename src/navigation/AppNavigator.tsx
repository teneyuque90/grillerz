import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { RootStackParamList } from './screenConfig';
import { SplashScreen } from '../screens/SplashScreen';
import { Onboarding01 } from '../screens/Onboarding01';
import { Onboarding02 } from '../screens/Onboarding02';
import { Onboarding03 } from '../screens/Onboarding03';
import { SignIn } from '../screens/SignIn';
import { ForgotPassword } from '../screens/ForgotPassword';
import { SignUp } from '../screens/SignUp';
import { VerificationCode } from '../screens/VerificationCode';
import { SetLocation } from '../screens/SetLocation';
import { ChooseLocation } from '../screens/ChooseLocation';
import { ChooseLanguage } from '../screens/ChooseLanguage';
import { Browse01 } from '../screens/Browse01';
import { Browse02 } from '../screens/Browse02';
import { Browse03 } from '../screens/Browse03';
import { Map } from '../screens/Map';
import { Categories } from '../screens/Categories';
import { Search } from '../screens/Search';
import { Filter } from '../screens/Filter';
import { Profile } from '../screens/Profile';
import { Schedule } from '../screens/Schedule';
import { ReviewBooking } from '../screens/ReviewBooking';
import { Payment } from '../screens/Payment';
import { Success } from '../screens/Success';
import { Bookings } from '../screens/Bookings';
import { BookingDetails } from '../screens/BookingDetails';
import { Connect } from '../screens/Connect';
import { Chat } from '../screens/Chat';
import { Calls } from '../screens/Calls';
import { Notifications } from '../screens/Notifications';
import { Account } from '../screens/Account';
import { Favorites } from '../screens/Favorites';
import { Settings } from '../screens/Settings';
import { useAppState } from '../state/AppStateContext';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { authUser, isHydrated } = useAppState();

  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      key={authUser ? 'signed-in' : 'signed-out'}
      initialRouteName={authUser ? 'Browse01' : 'SplashScreen'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="Onboarding01" component={Onboarding01} />
      <Stack.Screen name="Onboarding02" component={Onboarding02} />
      <Stack.Screen name="Onboarding03" component={Onboarding03} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="VerificationCode" component={VerificationCode} />
      <Stack.Screen name="SetLocation" component={SetLocation} />
      <Stack.Screen name="ChooseLocation" component={ChooseLocation} />
      <Stack.Screen name="ChooseLanguage" component={ChooseLanguage} />
      <Stack.Screen name="Browse01" component={Browse01} />
      <Stack.Screen name="Browse02" component={Browse02} />
      <Stack.Screen name="Browse03" component={Browse03} />
      <Stack.Screen name="Map" component={Map} />
      <Stack.Screen name="Categories" component={Categories} />
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Filter" component={Filter} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Schedule" component={Schedule} />
      <Stack.Screen name="ReviewBooking" component={ReviewBooking} />
      <Stack.Screen name="Payment" component={Payment} />
      <Stack.Screen name="Success" component={Success} />
      <Stack.Screen name="Bookings" component={Bookings} />
      <Stack.Screen name="BookingDetails" component={BookingDetails} />
      <Stack.Screen name="Connect" component={Connect} />
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="Calls" component={Calls} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="Account" component={Account} />
      <Stack.Screen name="Favorites" component={Favorites} />
      <Stack.Screen name="Settings" component={Settings} />
    </Stack.Navigator>
  );
}
