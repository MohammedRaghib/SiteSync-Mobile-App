import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import useCheckInfo from "../services/UserContext";
import log from "../components/Logger";
import { Ionicons } from "react-native-vector-icons";
import CustomAlert from "../components/CustomAlert";
import { Theme } from "../constants/Theme";

const TabButton = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    style={[
      styles.tabButton,
      isActive ? styles.activeTabButton : styles.inactiveTabButton,
    ]}
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
  const [alert, setAlert] = useState({
    visible: false,
    type: "success",
    message: "",
  });

  const BACKEND_API_URL = BACKEND_API_URLS.backend1;

  const [activeTab, setActiveTab] = useState("attendance");

  const [AttendanceData, setAttendanceData] = useState([]);
  const [AbsenteesData, setAbsenteesData] = useState([]);
  const [CheckoutsData, setCheckoutsData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchCheckIns = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(
        `${BACKEND_API_URL}supervisor_dashboard?supervisor_id=${user?.id}&project_id=${user?.projectId}`
      );
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
      const response = await fetch(
        `${BACKEND_API_URL}project_absentees?supervisor_id=${user?.id}&project_id=${user?.projectId}`
      );
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
      const response = await fetch(
        `${BACKEND_API_URL}project_checkouts?supervisor_id=${user?.id}&project_id=${user?.projectId}`
      );
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

  const handleDelete = (id, type) => {
    const isCheckIn = type === "checkin";
    const successMessageKey = isCheckIn
      ? "ui.checkinDeleteSuccess"
      : "ui.checkoutDeleteSuccess";

    const deleteCheckIn = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const response = await fetch(`${BACKEND_API_URL}delete_attendance/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, type }),
        });
        const jsonError = await response.json();
        if (!response.ok) {
          throw new Error(
            t("errors." + jsonError.error_type || "errors.serverError")
          );
        }
        setAlert({
          visible: true,
          type: "success",
          message: t(successMessageKey),
        });
        const call_function =
          type === "checkin" ? fetchCheckIns : fetchCheckouts;
        call_function();
      } catch (error) {
        log.error(error);
        setAlert({
          visible: true,
          type: "error",
          message: t(error.message),
        });
      } finally {
        setLoading(false);
      }
    };

    Alert.alert(
      t("ui.confirmDeleteTitle"),
      t("ui.confirmDeleteMessage", {
        type: t(isCheckIn ? "ui.checkIn" : "ui.checkOut"),
      }),
      [
        { text: t("ui.cancel"), style: "cancel" },
        { text: t("ui.delete"), style: "destructive", onPress: deleteCheckIn },
      ],
      { cancelable: true }
    );
  };

  const handleTabChange = (tab) => {
    if (activeTab === tab) return;
    setActiveTab(tab);
    setErrorMessage("");
    if (tab === "absentees" && AbsenteesData.length === 0) fetchAbsentees();
    else if (tab === "checkouts" && CheckoutsData.length === 0)
      fetchCheckouts();
    else if (tab === "attendance" && AttendanceData.length === 0)
      fetchCheckIns();
  };

  useEffect(() => {
    if (loggedIn && user?.role === "supervisor") {
      fetchCheckIns();
    }
  }, [loggedIn, user?.role]);

  const renderContent = () => {
    if (loading) return <Text style={styles.loading}>{t("ui.loading")}</Text>;
    if (errorMessage) return <Text style={styles.error}>{errorMessage}</Text>;

    if (activeTab === "absentees") {
      if (AbsenteesData.length === 0)
        return <Text style={styles.noData}>{t("ui.noData")}</Text>;
      return AbsenteesData.map((absentee) => (
        <View key={absentee.id} style={styles.itemContainer}>
          <Text style={styles.name}>{absentee.name}</Text>
        </View>
      ));
    }

    if (activeTab === "checkouts") {
      if (CheckoutsData.length === 0)
        return <Text style={styles.noData}>{t("ui.noData")}</Text>;
      return CheckoutsData.map((checkout) => (
        <View key={checkout.id} style={styles.itemContainer}>
          <View style={styles.textDetails}>
            <Text style={styles.name}>
              {t("ui.name")} - {checkout.subject?.name}
            </Text>
            <Text style={styles.status}>
              {t("ui.checkedoutby")}{" "}
              {checkout.is_supervisor_checkout
                ? t("ui.supervisor")
                : t("ui.guard")}{" "}
              -{" "}
              {new Date(checkout.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(checkout.id, "checkout")}
          >
            <Ionicons
              name="trash-outline"
              size={24}
              color={Theme.colors.dangerBorder}
            />
          </TouchableOpacity>
        </View>
      ));
    }

    if (AttendanceData.length === 0)
      return <Text style={styles.noData}>{t("ui.noData")}</Text>;
    return AttendanceData.map((attendance) => (
      <View key={attendance.id} style={styles.itemContainer}>
        <View style={styles.textDetails}>
          <Text style={styles.name}>
            {t("ui.name")} - {attendance.subject?.name}
          </Text>
          <Text style={styles.status}>
            {t("ui.checkedinby")}{" "}
            {attendance.is_supervisor_checkin
              ? t("ui.supervisor")
              : t("ui.guard")}{" "}
            -{" "}
            {new Date(attendance.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(attendance.id, "checkin")}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color={Theme.colors.dangerBorder}
          />
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ visible: false })}
      />
      {loggedIn && user?.role === "supervisor" && (
        <>
          <Text style={styles.title}>{t("ui.dashboard")}</Text>
          <View style={styles.tabBar}>
            <TabButton
              title={t("ui.checkIn")}
              isActive={activeTab === "attendance"}
              onPress={() => handleTabChange("attendance")}
            />
            <TabButton
              title={t("ui.checkOut")}
              isActive={activeTab === "checkouts"}
              onPress={() => handleTabChange("checkouts")}
            />
            <TabButton
              title={t("ui.absentees")}
              isActive={activeTab === "absentees"}
              onPress={() => handleTabChange("absentees")}
            />
          </View>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {renderContent()}
          </ScrollView>
        </>
      )}

      {loggedIn && user?.role === "guard" && (
        <>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("CheckIn")}
          >
            <Text style={styles.text}>{t("ui.checkIn")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("CheckOut")}
          >
            <Text style={styles.text}>{t("ui.checkOut")}</Text>
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
    backgroundColor: Theme.colors.backgroundBody,
    padding: Theme.spacing.s4,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: Theme.spacing.s2,
    marginBottom: Theme.spacing.s2,
    textAlign: "center",
    color: Theme.colors.textHeader,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.s4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: Theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    borderWidth: 1,
  },
  activeTabButton: {
    backgroundColor: Theme.colors.buttonBg,
    borderColor: Theme.colors.primaryBorder,
  },
  inactiveTabButton: {
    backgroundColor: Theme.colors.primaryLight,
    borderColor: Theme.colors.borderDefault,
  },
  tabText: {
    color: Theme.colors.textBody,
    fontSize: 14,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#ffffff",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Theme.colors.backgroundContainer,
    padding: Theme.spacing.s3,
    marginVertical: 6,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.borderDefault,
    elevation: 2,
  },
  textDetails: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.textHeader,
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    color: Theme.colors.textParagraph,
  },
  deleteButton: {
    padding: 5,
  },
  loading: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
  error: {
    fontSize: 16,
    color: Theme.colors.dangerBorder,
    textAlign: "center",
    marginVertical: 10,
  },
  noData: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
  link: {
    paddingVertical: 15,
    backgroundColor: Theme.colors.buttonBg,
    alignItems: "center",
    borderRadius: Theme.radius.md,
    marginVertical: 10,
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default DashboardScreen;
