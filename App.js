import React from "react";
import AppNavigator from "./navigation/AppNavigator";
import { UserProvider } from "./services/UserContext";

export default function App() {
  return (
    <UserProvider>
      <AppNavigator />
    </UserProvider>
  );
}
