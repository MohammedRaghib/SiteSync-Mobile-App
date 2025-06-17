import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import DashboardScreen from "../screens/DashboardScreen";
import CheckInScreen from "../screens/CheckInScreen";
import CheckOutScreen from "../screens/CheckOutScreen";
import TaskCheckScreen from "../screens/TaskCheckScreen";
import SpecialReEntryScreen from "../screens/SpecialReEntryScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="SpecialReEntry" component={SpecialReEntryScreen} />
        <Stack.Screen name="CheckIn" component={CheckInScreen} />
        <Stack.Screen name="TaskCheck" component={TaskCheckScreen} />
        <Stack.Screen name="CheckOut" component={CheckOutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
