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
import { Ionicons } from "react-native-vector-icons";
import useCheckInfo from "../services/UserContext";
import SwitchLanguage from "../Language/SwitchLanguage";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { setUser, loggedIn, setLoggedIn, BACKEND_API_URLS } = useCheckInfo();
  const { t } = useTranslation();

  const BACKEND_API_URL = BACKEND_API_URLS.backend1;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const expoToken = await getExpoPushToken();
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
        throw new Error(
          t("errors." + errorText.error_type || "errorLoginFailed")
        );
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
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getExpoPushToken = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return null;

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      return tokenData.data;
    } catch (error) {
      Alert.alert(t("errors.expo_token_required"));
      return null;
    }
  };

  const appVersion = Constants.expoConfig.version;

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

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t("auth.password")}
              placeholderTextColor={"black"}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="black"
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
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
      <Text style={styles.versionText}>Version: {appVersion}</Text>
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
    color: "black",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    color: "black",
    fontSize: 16,
  },
  eyeIcon: {
    marginLeft: 8,
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
  versionText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default LoginScreen;