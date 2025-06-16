import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import useCheckInfo from "../services/UserContext";

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, loggedIn } = useCheckInfo();

  const BACKEND_API_URL =
    "https://sitesync.angelightrading.com/home/angeligh/sitesyncdjango/api/";

  const [AbsenteesView, setAbsenteesView] = useState(false);
  const [AttendanceData, setAttendanceData] = useState([]);
  const [AbsenteesData, setAbsenteesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAttendance = async () => {
    // console.log(user);
    setLoading(true);
    setErrorMessage("");

    try {
      const peopleResponse = await fetch(
        `${BACKEND_API_URL}supervisor_dashboard/`,
        {
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

  const fetchAbsentees = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const absenteesResponse = await fetch(
        `${BACKEND_API_URL}project_absentees?supervisor_id=${user?.id}`,
        {
          method: "GET",
        }
      );

      if (!absenteesResponse.ok) {
        console.error(
          "Error fetching absentees data:",
          absenteesResponse.statusText
        );
        setErrorMessage(t("errors.fetchError"));
        throw new Error(t("errors.fetchError"));
      }

      const jsonAbsenteesData = await absenteesResponse.json();
      setAbsenteesData(jsonAbsenteesData.project_absentees || []);
    } catch (error) {
      console.error("Error fetching absentees data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <View style={styles.container}>
      <>
        {loggedIn && user?.role === "supervisor" && (
          <>
            {!AbsenteesView ? (
              <TouchableOpacity
                style={styles.absenteesLink}
                onPress={() => {
                  setAbsenteesView(true);
                  fetchAbsentees();
                }}
              >
                <Text style={styles.title}>{t("ui.absentees")}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.absenteesLink}
                onPress={() => setAbsenteesView(false)}
              >
                <Text style={styles.title}>{t("ui.back")}</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.title}>{t("ui.dashboard")}</Text>

            <View style={styles.header}>
              <Text style={styles.headerText}>{t("ui.name")}</Text>
              <Text style={styles.headerText}>{t("ui.status")}</Text>
            </View>

            {loading ? (
              <Text style={styles.loading}>{t("ui.loading")}</Text>
            ) : errorMessage ? (
              <Text style={styles.error}>{errorMessage}</Text>
            ) : AbsenteesView ? (
              AbsenteesData.length > 0 ? (
                AbsenteesData.map((absentee) => (
                  <View key={absentee.person_id} style={styles.item}>
                    <Text style={styles.name}>{absentee.person_name}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noData}>{t("ui.noData")}</Text>
              )
            ) : AttendanceData.length > 0 ? (
              AttendanceData.map((attendance) => (
                <View
                  key={attendance.attendance_subject?.person_id}
                  style={styles.item}
                >
                  <Text style={styles.name}>
                    {attendance.attendance_subject?.person_name}
                  </Text>
                  <Text style={styles.status}>
                    {attendance.attendance_is_check_in
                      ? t("attendance.checkIn")
                      : t("attendance.checkOut")}{" "}
                    -{" "}
                    {new Date(
                      attendance.attendance_timestamp
                    ).toLocaleTimeString([], {
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
          </>
        )}
      </>

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
  absenteesLink: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },
});

export default DashboardScreen;
