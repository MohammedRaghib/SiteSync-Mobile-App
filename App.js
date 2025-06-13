import AppNavigator from "./navigation/AppNavigator";
import { CheckInfoProvider } from "./services/UserContext";

export default function App() {
  return (
    <CheckInfoProvider>
      <AppNavigator />
    </CheckInfoProvider>
  );
}
