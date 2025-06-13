import AppNavigator from "./navigation/AppNavigator";
import { CheckInfoProvider } from "./services/UserContext";
import './Language/i18n.jsx';

export default function App() {
  return (
    <CheckInfoProvider>
      <AppNavigator />
    </CheckInfoProvider>
  );
}
