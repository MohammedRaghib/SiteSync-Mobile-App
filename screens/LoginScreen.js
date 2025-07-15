import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import useCheckInfo from "../services/UserContext";
import SwitchLanguage from "../Language/SwitchLanguage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { setUser, loggedIn, setLoggedIn, BACKEND_API_URLS } = useCheckInfo();
  const { t } = useTranslation();

  const BACKEND_API_URL = BACKEND_API_URLS.backend1;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage(t("errors.errorRequired"));
      return;
    }
    setErrorMessage("");
    setLoading(true);
    try {
      const expoToken = await getExpoToken();
      const formData = new FormData();
      formData.append("username", username.trim());
      formData.append("password", password);
      formData.append("expo_token", expoToken);

      const userResponse = await fetch(`${BACKEND_API_URL}login/`, {
        method: "POST",
        body: formData,
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.json();
        throw new Error(t("errors." + errorText.error_type || "errorLoginFailed"));
      }

      setErrorMessage("");
      const userData = await userResponse.json();
      const { person_id, role_name } = userData;

      const newUser = {
        id: person_id,
        role: role_name,
      };
      setLoggedIn(true);
      setUser((prevUser) => ({
        ...prevUser,
        ...newUser,
      }));

      navigation.navigate("Home");
      // Alert.alert(t("successLogin"));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  async function getExpoToken() {
    if (!Device.isDevice) {
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
    } catch (error) {
      Alert.alert(t("errors.expo_token_required"));
      return null;
    }

    const expoPushToken = tokenData.data;

    return expoPushToken;
  }

  return (
    <>
      {!loggedIn ? (
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder={t("auth.username")}
            placeholderTextColor={"black"}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder={t("auth.password")}
            placeholderTextColor={"black"}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? t("ui.loading") : t("auth.login")}
            </Text>
          </TouchableOpacity>
          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.container}>
          <Text>{t("auth.alreadyLoggedIn")}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.buttonText}>{t("ui.dashboard")}</Text>
          </TouchableOpacity>
        </View>
      )}
      <SwitchLanguage />
      {/* <TouchableOpacity
        style={styles.button}
        onPress={async () => {
          const token = await getExpoPushToken();
          if (token) {
            Alert.alert(t("successToken"), token);
          } else {
            Alert.alert(t("errorToken"));
          }
        }}
      >
        <Text style={styles.buttonText}>
          {Platform.OS === "web" ? t("ui.getTokenWeb") : t("ui.getToken")}
        </Text>
      </TouchableOpacity> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  input: {
    width: "80%",
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: 14,
    marginTop: 10,
  },
});

export default LoginScreen;
