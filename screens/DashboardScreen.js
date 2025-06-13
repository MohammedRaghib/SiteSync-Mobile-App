import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import useCheckInfo from "../services/UserContext";

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, loggedIn, hasAccess, refreshAccessToken } = useCheckInfo();

  const BACKEND_API_URL = "https://sitesync.angelightrading.com/home/angeligh/sitesyncdjango/api/";

  const [AttendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAttendance = async () => {
    // console.log(user);
    setLoading(true);
    setErrorMessage("");

    try {
      const peopleResponse = await fetch(
        `${BACKEND_API_URL}supervisor_dashboard/`, {
        method: "GET",
      }
      );

      if (!peopleResponse.ok) {
        setErrorMessage(t("errors.fetchError"));
        throw new Error(t("errors.fetchError"));
      }

      const jsonAttendanceData = await peopleResponse.json();
      setAttendanceData(jsonAttendanceData.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasAccess({ requiresLogin: true, allowedRoles: ["supervisor"] })) {
      navigation.navigate("CheckIn");
    }
  }, [user, loggedIn]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("ui.dashboard")}</Text>

      <View style={styles.header}>
        <Text style={styles.headerText}>{t("ui.name")}</Text>
        <Text style={styles.headerText}>{t("ui.status")}</Text>
      </View>

      {loading ? (
        <Text style={styles.loading}>{t("ui.loading")}</Text>
      ) : errorMessage ? (
        <Text style={styles.error}>{errorMessage}</Text>
      ) : AttendanceData.length > 0 ? (
        AttendanceData.map((attendance) => (
          <View key={attendance.attendance_subject?.person_id} style={styles.item}>
            <Text style={styles.name}>{attendance.attendance_subject?.person_name}</Text>
            <Text style={styles.status}>{attendance.attendance_is_check_in ? t("attendance.checkIn") : t("attendance.checkOut")}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noData}>{t("ui.noData")}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
  },
  name: {
    fontSize: 16,
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  loading: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
  },
  error: {
    fontSize: 16,
    color: "red",
    marginVertical: 10,
  },
  noData: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#666",
  },
});

export default DashboardScreen;