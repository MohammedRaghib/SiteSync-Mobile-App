import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import useCheckInfo from "../services/UserContext";
import useAttendanceAndChecks from "../services/useAttendanceChecks";
import { all } from "axios";

function SpecialReEntryScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, loggedIn } = useCheckInfo();

  const BACKEND_API_URL =
    "https://sitesync.angelightrading.com/home/angeligh/sitesyncdjango/api/";

  const [SpecialReEntries, setSpecialReEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { SpecialReEntry } = useAttendanceAndChecks();

  const fetchEntries = async () => {
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
      setSpecialReEntries(jsonSpecialReEntries.special_re_entries || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const HandleEntry = async (id, allowed) => {
    ToSend = {
      attendance_subject_id: id,
      attendance_is_special_re_entry: allowed,
      attendance_is_unauthorized: allowed ? false : true,
      attendance_is_approved_by_supervisor: allowed,
      attendance_is_entry_permitted: allowed,
    };

    try {
      const specialReEntry = await SpecialReEntry(ToSend);
      Alert.alert(t(specialReEntry));
    } catch (error) {
      console.error("Error handling entry:", error);
      setErrorMessage(t("errors.checkinFailure"));
    }
  };

  useEffect(() => {
    fetchEntries();
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
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() =>
                      HandleEntry(entry.attendance_subject_id, true)
                    }
                    style={[styles.button, styles.acceptButton]}
                  >
                    <Text style={styles.buttonText}>{t("ui.accept")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      HandleEntry(entry.attendance_subject_id, false)
                    }
                    style={[styles.button, styles.declineButton]}
                  >
                    <Text style={styles.buttonText}>{t("ui.decline")}</Text>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: "#f4f4f4",
    padding: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
    marginBottom: 20,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    flex: 1,
  },
  item: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    flex: 1.5,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    flex: 1,
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  declineButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
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
});

export default SpecialReEntryScreen;
