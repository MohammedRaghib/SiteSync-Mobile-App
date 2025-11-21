import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useCheckInfo from "../services/UserContext";
import { useEffect } from "react";

function HomeScreen() {
  const navigation = useNavigation();
  const { user, loggedIn } = useCheckInfo();
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (user.role === "admin" || user.role === "manager") {
        navigation.navigate("RegisterPerson");
      }
    });

    return unsubscribe;
  }, [navigation, user]);

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
    backgroundColor: "#f5f5f5",
  },
  link: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#007AFF",
    width: "80%",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HomeScreen;
