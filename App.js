import AppNavigator from "./AppNavigator";
import { CheckInfoProvider } from "./services/UserContext";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";
import "./Language/i18n.jsx";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      //Debug console.log("📩 Foreground Notification:", notification);
    });

    return () => subscription.remove();
  }, []);

  return (
    <CheckInfoProvider>
      <AppNavigator />
    </CheckInfoProvider>
  );
}