import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import DashboardScreen from "../screens/DashboardScreen";
import CheckInScreen from "../screens/CheckInScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="CheckIn" component={CheckInScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
