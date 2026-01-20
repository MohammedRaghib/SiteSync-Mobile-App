import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useCheckInfo from "../services/UserContext";
import { Theme } from "../constants/Theme";

function HomeScreen() {
  const navigation = useNavigation();
  const { user, loggedIn } = useCheckInfo();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {loggedIn && user?.role === "supervisor" && (
        <>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("SpecialReEntry")}
          >
            <Text style={styles.text}>{t("ui.specialReEntry")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <Text style={styles.text}>{t("ui.dashboard")}</Text>
          </TouchableOpacity>
        </>
      )}

      {loggedIn && (
        <>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("CheckOut")}
          >
            <Text style={styles.text}>{t("ui.checkOut")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("CheckIn")}
          >
            <Text style={styles.text}>{t("ui.checkIn")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("Projects")}
          >
            <Text style={styles.text}>{t("ui.projects")}</Text>
          </TouchableOpacity>
        </>
      )}

      {!loggedIn && (
        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.text}>{t("ui.login")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "5%",
    backgroundColor: Theme.colors.backgroundBody,
  },
  link: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: Theme.colors.buttonBg,
    width: "80%",
    alignItems: "center",
    borderRadius: Theme.radius.md,
    marginVertical: Theme.spacing.s2,
    borderWidth: 1,
    borderColor: Theme.colors.primaryBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HomeScreen;
