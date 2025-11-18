import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import useCheckInfo from "../services/UserContext";
import log from "../components/Logger";

const TabButton = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.activeTabButton]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, loggedIn, BACKEND_API_URLS } = useCheckInfo();

  const BACKEND_API_URL = BACKEND_API_URLS.backend1;

  const [activeTab, setActiveTab] = useState('attendance');

  const [AttendanceData, setAttendanceData] = useState([]);
  const [AbsenteesData, setAbsenteesData] = useState([]);
  const [CheckoutsData, setCheckoutsData] = useState([]);

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

  const fetchCheckouts = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${BACKEND_API_URL}project_checkouts?supervisor_id=${user?.id}&project_id=${user?.projectId}`);

      if (!response.ok) {
        const jsonError = await response.json();
        throw new Error(t("errors." + jsonError.error_type || "fetchError"));
      }

      const json = await response.json();
      setCheckoutsData(json.data || []);
    } catch (error) {
      log.error(error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleTabChange = (tab) => {
    if (activeTab === tab) return;

    setActiveTab(tab);
    setErrorMessage('');

    if (tab === 'absentees' && AbsenteesData.length === 0) {
      fetchAbsentees();
    } else if (tab === 'checkouts' && CheckoutsData.length === 0) {
      fetchCheckouts();
    } else if (tab === 'attendance' && AttendanceData.length === 0) {
      fetchAttendance();
    }
  };


  useEffect(() => {
    if (loggedIn && user?.role === "supervisor") {
      fetchAttendance();
    }
  }, [loggedIn, user?.role]);


  const renderContent = () => {
    if (loading) {
      return <Text style={styles.loading}>{t("ui.loading")}</Text>;
    }

    if (errorMessage) {
      return <Text style={styles.error}>{errorMessage}</Text>;
    }

    if (activeTab === 'absentees') {
      const data = AbsenteesData;
      if (data.length === 0) return <Text style={styles.noData}>{t("ui.noData")}</Text>;

      return data.map((absentee) => (
        <View key={absentee.id} style={styles.item}>
          <Text style={styles.name}>{absentee.name}</Text>
        </View>
      ));
    }

    if (activeTab === 'checkouts') {
      const data = CheckoutsData;
      if (data.length === 0) return <Text style={styles.noData}>{t("ui.noData")}</Text>;

      return data.map((checkout) => (
        <View key={checkout.subject?.id} style={styles.item}>
          <Text style={styles.name}>
            {t("ui.name")} - {checkout.subject?.name}
          </Text>
          <Text style={styles.status}>
            {t("ui.checkedoutby")} {checkout.is_supervisor_checkout ? t("ui.supervisor") : t("ui.guard")} - {new Date(checkout.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
        </View>
      ));
    }

    const data = AttendanceData;
    if (data.length === 0) return <Text style={styles.noData}>{t("ui.noData")}</Text>;

    return data.map((attendance) => (
      <View key={attendance.subject?.id} style={styles.item}>
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
    ));
  };


  return (
    <View style={styles.container}>
      {loggedIn && user?.role === "supervisor" && (
        <>
          <Text style={styles.title}>{t("ui.dashboard")}</Text>

          <View style={styles.tabBar}>
            <TabButton
              title={t("attendance.checkIn")}
              isActive={activeTab === 'attendance'}
              onPress={() => handleTabChange('attendance')}
            />
            <TabButton
              title={t("attendance.checkOut")}
              isActive={activeTab === 'checkouts'}
              onPress={() => handleTabChange('checkouts')}
            />
            <TabButton
              title={t("ui.absentees")}
              isActive={activeTab === 'absentees'}
              onPress={() => handleTabChange('absentees')}
            />
          </View>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {renderContent()}
          </ScrollView>
        </>
      )}

      {loggedIn && user?.role === "guard" && (
        <>
          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate("CheckIn")}>
            <Text style={styles.text}>{t("attendance.checkIn")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate("CheckOut")}>
            <Text style={styles.text}>{t("attendance.checkOut")}</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  activeTabButton: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    color: "#444",
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTabText: {
    color: "#fff",
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
    fontWeight: "600",
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: "400",
    color: "#666",
  },
  loading: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
    marginTop: 20,
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
    marginTop: 20,
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
});

export default DashboardScreen;