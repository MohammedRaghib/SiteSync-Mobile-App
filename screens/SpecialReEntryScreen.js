import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import useCheckInfo from "../services/UserContext";
import useAttendanceAndChecks from "../services/useAttendanceChecks";
import CustomAlert from "../components/CustomAlert";
import { Theme } from "../constants/Theme";

function SpecialReEntryScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, loggedIn, BACKEND_API_URLS } = useCheckInfo();

  const BACKEND_API_URL = BACKEND_API_URLS.backend1;
  const [SpecialReEntries, setSpecialReEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { SpecialReEntry } = useAttendanceAndChecks();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  const fetchEntries = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(
        `${BACKEND_API_URL}get_special_re_entries?project_id=${user?.projectId}`
      );

      if (!response.ok) {
        const jsonError = await response.json();
        throw new Error(t("errors." + jsonError.error_type || "fetchError"));
      }

      const json = await response.json();
      setSpecialReEntries(json.special_re_entries || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const HandleEntry = async (id, allowed) => {
    setLoading(true);
    const ToSend = {
      subject_id: id,
      is_approved_by_supervisor: allowed,
    };

    try {
      const response = await SpecialReEntry(ToSend);

      if (!response.success) {
        throw new Error(t(response?.message || "errors.checkinFailure"));
      }

      setAlertMessage(
        t(response.message || "ui.checkinConfirmed", {
          name: response.subject_name,
        })
      );
      setAlertType("success");
      setAlertVisible(true);

      fetchEntries();
    } catch (error) {
      setAlertMessage(error.message);
      setAlertType("error");
      setAlertVisible(true);
    } finally {
      await fetchEntries();
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <View style={styles.container}>
      <CustomAlert
        visible={alertVisible}
        type={alertType}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      {user?.role === "supervisor" && (
        <>
          <Text style={styles.title}>{t("ui.specialReEntry")}</Text>

          {loading ? (
            <Text style={styles.loading}>{t("ui.loading")}</Text>
          ) : errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : SpecialReEntries.length > 0 ? (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {SpecialReEntries.map((entry) => (
                <View key={entry.subject?.id} style={styles.item}>
                  <Text style={styles.name}>{entry.subject?.name}</Text>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() => HandleEntry(entry.subject?.id, true)}
                      style={[styles.button, styles.acceptButton]}
                    >
                      <Text style={styles.buttonText}>{t("ui.accept")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => HandleEntry(entry.subject?.id, false)}
                      style={[styles.button, styles.declineButton]}
                    >
                      <Text style={styles.buttonText}>{t("ui.decline")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
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
            <Text style={styles.text}>{t("ui.checkOut")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("CheckIn")}
          >
            <Text style={styles.text}>{t("ui.checkIn")}</Text>
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
    backgroundColor: Theme.colors.backgroundBody,
    padding: Theme.spacing.s4,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  title: {
    paddingTop: 20,
    fontSize: 26,
    fontWeight: "700",
    color: Theme.colors.textHeader,
    marginBottom: Theme.spacing.s4,
    textAlign: "center",
  },
  item: {
    backgroundColor: Theme.colors.backgroundContainer,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.s3,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Theme.colors.borderDefault,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  name: {
    fontSize: 16,
    color: Theme.colors.textBody,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.lg,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: Theme.colors.secondaryBorder,
  },
  declineButton: {
    backgroundColor: Theme.colors.dangerBorder,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  loading: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    textAlign: "center",
    marginTop: 30,
  },
  error: {
    fontSize: 16,
    color: Theme.colors.dangerBorder,
    textAlign: "center",
    marginTop: 30,
    fontWeight: "bold",
  },
  noData: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    textAlign: "center",
    marginTop: 30,
  },
  link: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: Theme.colors.buttonBg,
    alignItems: "center",
    borderRadius: Theme.radius.md,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Theme.colors.primaryBorder,
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SpecialReEntryScreen;
