import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import useCheckInfo from "../services/UserContext";

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, loggedIn, BACKEND_API_URLS } = useCheckInfo();

  const BACKEND_API_URL = BACKEND_API_URLS.backend1;

  const [AbsenteesView, setAbsenteesView] = useState(false);
  const [AttendanceData, setAttendanceData] = useState([]);
  const [AbsenteesData, setAbsenteesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAttendance = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${BACKEND_API_URL}supervisor_dashboard?supervisor_id=${user?.id}&project_id=${user?.projectId}`);
      if (!response.ok) {
        const jsonError = await response.json();
        throw new Error(t("errors." + jsonError.error_type || "fetchError"));
      }
      const json = await response.json();
      setAttendanceData(json.data || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAbsentees = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${BACKEND_API_URL}project_absentees?supervisor_id=${user?.id}&project_id=${user?.projectId}`);

      if (!response.ok) {
        const jsonError = await response.json();
        throw new Error(t("errors." + jsonError.error_type || "fetchError"));
      }
      const json = await response.json();
      setAbsenteesData(json.project_absentees || []);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <View style={styles.container}>
      {loggedIn && user?.role === "supervisor" && (
        <>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.absenteesLink}
              onPress={() => {
                if (AbsenteesView) {
                  setAbsenteesView(false);
                } else {
                  setAbsenteesView(true);
                  fetchAbsentees();
                }
              }}
            >
              <Text style={styles.linkText}>
                {AbsenteesView ? t("ui.back") : t("ui.absentees")}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{t("ui.dashboard")}</Text>

          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {loading ? (
              <Text style={styles.loading}>{t("ui.loading")}</Text>
            ) : errorMessage ? (
              <Text style={styles.error}>{errorMessage}</Text>
            ) : AbsenteesView ? (
              AbsenteesData.length > 0 ? (
                AbsenteesData.map((absentee) => (
                  <View key={absentee.id} style={styles.item}>
                    <Text style={styles.name}>{absentee.name}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noData}>{t("ui.noData")}</Text>
              )
            ) : AttendanceData.length > 0 ? (
              AttendanceData.map((attendance) => (
                <View
                  key={attendance.subject?.id}
                  style={styles.item}
                >
                  <Text style={styles.name}>
                    {t("ui.name")} - {attendance.subject?.name}
                  </Text>
                  <Text style={styles.status}>
                    {t("ui.checkedinby")} {attendance.is_supervisor_checkin ? t("ui.supervisor") : t("ui.guard")} - {new Date(attendance.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noData}>{t("ui.noData")}</Text>
            )}
          </ScrollView>
        </>
      )}

      {loggedIn && user?.role === "guard" && (
        <>
          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate("CheckIn")}>
            <Text style={styles.text}>{t("attendance.checkOut")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate("CheckIn")}>
            <Text style={styles.text}>{t("attendance.checkIn")}</Text>
          </TouchableOpacity>
        </>
      )}

      {!loggedIn && (
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.text}>{t("ui.login")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
  },
  item: {
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  name: {
    fontSize: 16,
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginTop: 4,
  },
  loading: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
  },
  error: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  noData: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
  },
  link: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#007AFF",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 10,
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  absenteesLink: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "flex-end",
  },
  linkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DashboardScreen;