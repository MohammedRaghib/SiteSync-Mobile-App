import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import useCheckInfo from "../services/UserContext";

function SpecialReEntryScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, loggedIn } = useCheckInfo();

  const BACKEND_API_URL = "https://sitesync.angelightrading.com/home/angeligh/sitesyncdjango/api/";

  const [SpecialReEntries, setSpecialReEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAttendance = async () => {
    // console.log(user);
    setLoading(true);
    setErrorMessage("");

    try {
      const peopleResponse = await fetch(
        `${BACKEND_API_URL}get_special_re_entries/`,
        {
          method: "GET",
        }
      );

      if (!peopleResponse.ok) {
        setErrorMessage(t("errors.fetchError"));
        throw new Error(t("errors.fetchError"));
      }

      const jsonSpecialReEntries = await peopleResponse.json();
      setSpecialReEntries(jsonSpecialReEntries.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <View style={styles.container}>
      {user?.role === "supervisor" && (
        <>
          <Text style={styles.title}>{t("ui.specialReEntry")}</Text>

          <View style={styles.header}>
            <Text style={styles.headerText}>{t("ui.name")}</Text>
            <Text style={styles.headerText}>{t("ui.actions")}</Text>
          </View>

          {loading ? (
            <Text style={styles.loading}>{t("ui.loading")}</Text>
          ) : errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : SpecialReEntries.length > 0 ? (
            SpecialReEntries.map((entry) => (
              <View
                key={entry.attendance_subject?.person_id}
                style={styles.item}
              >
                <Text style={styles.name}>
                  {entry.attendance_subject?.person_name}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>{t("ui.noData")}</Text>
          )}
        </>
      )}

      {loggedIn && user?.role === "guard" && (
        <>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("CheckIn")}
          >
            <Text style={styles.text}>{t("attendance.checkOut")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("CheckIn")}
          >
            <Text style={styles.text}>{t("attendance.checkIn")}</Text>
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
    backgroundColor: "#f8f8f8",
    padding: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#e0e0e0",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    flex: 1,
    textAlign: "left",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 2,
  },
  status: {
    fontSize: 15,
    color: "#666",
    flex: 1,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    flex: 2,
    justifyContent: "flex-end",
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  declineButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  loading: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 30,
  },
  error: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    marginTop: 30,
    fontWeight: "bold",
  },
  noData: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 30,
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
export default SpecialReEntryScreen;
