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
import log from "../components/Logger";
import { Theme } from "../constants/Theme";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { setUser, loggedIn, setLoggedIn, BACKEND_API_URLS, setBackendUrls } =
    useCheckInfo();
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

      const userResponse = await fetch(`${BACKEND_API_URL}login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          expo_token: expoToken,
        }),
      });

      const rawText = await userResponse.text();

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        throw new Error(t("errors.errorLoginFailed"));
      }

      if (!userResponse.ok) {
        throw new Error(t("errors." + (data.error_type || "errorLoginFailed")));
      }

      const { person_id, role_name } = data;

      const newUser = {
        id: person_id,
        role: role_name,
      };
      setLoggedIn(true);
      setUser((prevUser) => ({
        ...prevUser,
        ...newUser,
      }));

      navigation.navigate("Projects");
    } catch (error) {
      log.error(error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getExpoPushToken = async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
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
      log.error("Failed to get Expo push token:", error);
      setErrorMessage(t("errors.expo_token_required"));
      return null;
    }
  };

  const handleSwitchUrl = () => {
    setBackendUrls((prevURLs) => ({
      backend1: prevURLs.backend2,
      backend2: prevURLs.backend1,
    }));

    Alert.alert(t("ui.urlSwitched"));
  };

  const appVersion = Constants.expoConfig.version;

  return (
    <>
      {!loggedIn ? (
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder={t("auth.username")}
            placeholderTextColor={Theme.colors.textMuted}
            value={username}
            onChangeText={setUsername}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t("auth.password")}
              placeholderTextColor={Theme.colors.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color={Theme.colors.textBody}
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
          <Text style={styles.alreadyText}>{t("auth.alreadyLoggedIn")}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.buttonText}>{t("ui.dashboard")}</Text>
          </TouchableOpacity>
        </View>
      )}
      <SwitchLanguage />
      <TouchableOpacity onPress={handleSwitchUrl}>
        <Text style={styles.versionText}>Version: {appVersion}</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.s6,
    backgroundColor: Theme.colors.backgroundBody,
  },
  input: {
    width: "80%",
    height: 48,
    borderWidth: 1,
    borderColor: Theme.colors.borderDefault,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: Theme.spacing.s4,
    color: Theme.colors.textBody,
    backgroundColor: Theme.colors.backgroundContainer,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    height: 48,
    borderWidth: 1,
    borderColor: Theme.colors.borderDefault,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 10,
    marginBottom: Theme.spacing.s4,
    backgroundColor: Theme.colors.backgroundContainer,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    color: Theme.colors.textBody,
    fontSize: 16,
  },
  eyeIcon: {
    marginLeft: 8,
    zIndex: 10,
  },
  button: {
    backgroundColor: Theme.colors.buttonBg,
    padding: 12,
    borderRadius: Theme.radius.md,
    width: "80%",
    alignItems: "center",
    marginTop: Theme.spacing.s2,
    borderWidth: 1,
    borderColor: Theme.colors.primaryBorder,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  error: {
    color: Theme.colors.dangerBorder,
    fontSize: 14,
    marginTop: 10,
  },
  alreadyText: {
    color: Theme.colors.textBody,
    marginBottom: Theme.spacing.s4,
    fontSize: 16,
  },
  footer: {
    flex: 1,
    backgroundColor: Theme.colors.backgroundBody,
    paddingBottom: 20,
    alignItems: "center",
  },
  versionText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
});

export default LoginScreen;
