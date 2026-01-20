import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import CheckBox from "@react-native-community/checkbox";
import useCheckInfo from "../services/UserContext";
import useAttendanceAndChecks from "../services/useAttendanceChecks";
import CustomAlert from "../components/CustomAlert";
import { Theme } from "../constants/Theme";

function TaskCheckScreen() {
  const route = useRoute();
  const { t } = useTranslation();
  const { faceData } = route.params || {};
  const navigation = useNavigation();
  const { user, loggedIn, BACKEND_API_URLS } = useCheckInfo();
  const { CheckOutAttendance } = useAttendanceAndChecks();

  const [state, setState] = useState({
    tasks: [],
    loading: false,
    submitting: false,
    error: null,
    allTasksCompleted: false,
    allEquipmentReturned: false,
  });

  const [alert, setAlert] = useState({
    visible: false,
    type: "success",
    message: "",
  });

  const BACKEND_API_URL = BACKEND_API_URLS.backend1;

  const showAlert = (type, message) => {
    setAlert({
      visible: true,
      type,
      message,
    });
  };

  const closeAlert = () => setAlert({ ...alert, visible: false });

  const fetchTasks = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(
        `${BACKEND_API_URL}get_person_tasks/${faceData?.id}/`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(t("errors.fetchError"));
      }

      setState((prev) => ({ ...prev, tasks: data.tasks || [] }));
    } catch (e) {
      setState((prev) => ({ ...prev, error: e.message }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const toggleSelection = (type) => {
    setState((prev) => {
      const newState = { ...prev };
      if (type === "allTasks") {
        newState.allTasksCompleted = !prev.allTasksCompleted;
      } else if (type === "allEquipment") {
        newState.allEquipmentReturned = !prev.allEquipmentReturned;
      }
      return newState;
    });
  };

  const toggleSelectAll = () => {
    setState((prev) => ({
      ...prev,
      allTasksCompleted:
        prev.allTasksCompleted && prev.allEquipmentReturned ? false : true,
      allEquipmentReturned:
        prev.allEquipmentReturned && prev.allTasksCompleted ? false : true,
    }));
  };

  const handleSubmit = async () => {
    setState((prev) => ({ ...prev, submitting: true }));
    try {
      const success = await CheckOutAttendance({
        ...faceData,
        is_work_completed: state.allTasksCompleted,
        is_equipment_returned: state.allEquipmentReturned,
        is_incomplete_checkout:
          !state.allTasksCompleted || !state.allEquipmentReturned,
      });

      if (!success.success) {
        throw new Error(t(success?.message || "errors.serverError"));
      }

      showAlert(
        "success",
        t(success?.message || "attendance.checkoutSuccess", {
          name: success.subject_name,
        })
      );

      setTimeout(() => {
        navigation.navigate("Home");
      }, 1500);
    } catch (error) {
      if (error.message.includes("Network request failed")) {
        showAlert("error", t("errors.networkError"));
      } else {
        showAlert("error", error.message);
      }
    } finally {
      setState((prev) => ({ ...prev, submitting: false }));
    }
  };

  useEffect(() => {
    if (faceData?.id) {
      fetchTasks();
    }
  }, [faceData]);

  const renderEquipment = (task) => {
    if (!task.equipment || task.equipment.length === 0) {
      return <Text style={styles.noEquipmentText}>{t("ui.noEquipment")}</Text>;
    }

    return task.equipment.map((equipment) => (
      <View key={equipment.id} style={styles.equipmentItem}>
        <Text style={styles.equipmentName}>{equipment.name}</Text>
      </View>
    ));
  };

  if (!faceData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t("ui.noData")}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{t("ui.back")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        message={alert.message}
        onClose={closeAlert}
      />

      {user?.role === "supervisor" && (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{t("ui.supervisorTaskCheck")}</Text>
            <View style={styles.workerBadge}>
              <Text style={styles.workerName}>
                {faceData?.name || t("errors.noName")}
              </Text>
            </View>
          </View>

          <View style={styles.globalCheckboxes}>
            <TouchableOpacity
              style={styles.checkboxOption}
              onPress={toggleSelectAll}
            >
              <CheckBox
                value={state.allTasksCompleted && state.allEquipmentReturned}
                onValueChange={toggleSelectAll}
                tintColors={{
                  true: Theme.colors.primaryBorder,
                  false: Theme.colors.borderDefault,
                }}
              />
              <Text style={[styles.checkboxLabel, { fontWeight: "bold" }]}>
                {t("ui.selectAll")}
              </Text>
            </TouchableOpacity>

            <View style={styles.inlineCheckboxes}>
              <TouchableOpacity
                style={styles.checkboxOption}
                onPress={() => toggleSelection("allTasks")}
              >
                <CheckBox
                  value={state.allTasksCompleted}
                  onValueChange={() => toggleSelection("allTasks")}
                  tintColors={{
                    true: Theme.colors.primaryBorder,
                    false: Theme.colors.borderDefault,
                  }}
                />
                <Text style={styles.checkboxLabel}>
                  {t("ui.allTasksCompleted")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxOption}
                onPress={() => toggleSelection("allEquipment")}
              >
                <CheckBox
                  value={state.allEquipmentReturned}
                  onValueChange={() => toggleSelection("allEquipment")}
                  tintColors={{
                    true: Theme.colors.primaryBorder,
                    false: Theme.colors.borderDefault,
                  }}
                />
                <Text style={styles.checkboxLabel}>
                  {t("ui.allEquipmentReturned")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollViewContent}>
            {state.loading ? (
              <ActivityIndicator
                size="large"
                color={Theme.colors.primaryBorder}
                style={styles.loadingIndicator}
              />
            ) : state.error ? (
              <Text style={styles.errorText}>{state.error}</Text>
            ) : state.tasks.length > 0 ? (
              state.tasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  <Text style={styles.taskName}>{task.name}</Text>
                  <Text style={styles.equipmentHeader}>
                    {t("ui.equipment")}:
                  </Text>
                  {renderEquipment(task)}
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>{t("ui.noData")}</Text>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.submitButton,
              state.submitting && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={state.submitting}
          >
            {state.submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{t("ui.submit")}</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {loggedIn && user?.role === "guard" && (
        <>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("CheckIn")}
          >
            <Text style={styles.linkText}>{t("ui.checkOut")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate("CheckIn")}
          >
            <Text style={styles.linkText}>{t("ui.checkIn")}</Text>
          </TouchableOpacity>
        </>
      )}

      {!loggedIn && (
        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.linkText}>{t("ui.login")}</Text>
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
  headerContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: Theme.spacing.s4,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Theme.colors.textHeader,
    textAlign: "center",
    marginBottom: Theme.spacing.s2,
  },
  workerBadge: {
    backgroundColor: Theme.colors.secondaryLight,
    paddingHorizontal: Theme.spacing.s4,
    paddingVertical: Theme.spacing.s1,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.secondaryBorder,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.primaryBorder,
    textAlign: "center",
  },
  globalCheckboxes: {
    backgroundColor: Theme.colors.backgroundContainer,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.s3,
    marginBottom: Theme.spacing.s4,
    borderWidth: 1,
    borderColor: Theme.colors.borderDefault,
    elevation: 2,
  },
  inlineCheckboxes: {
    flexDirection: "column",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderDefault,
  },
  checkboxOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 8,
    color: Theme.colors.textBody,
  },
  scrollViewContent: {
    flex: 1,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: Theme.colors.dangerBorder,
    textAlign: "center",
    marginTop: 30,
    fontWeight: "bold",
  },
  noDataText: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    textAlign: "center",
    marginTop: 30,
  },
  taskCard: {
    backgroundColor: Theme.colors.backgroundContainer,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.s3,
    marginBottom: Theme.spacing.s3,
    borderWidth: 1,
    borderColor: Theme.colors.borderDefault,
    elevation: 2,
  },
  taskName: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.textHeader,
    marginBottom: Theme.spacing.s2,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.backgroundBody,
    paddingBottom: 4,
  },
  equipmentHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.colors.textParagraph,
    marginBottom: 4,
  },
  equipmentItem: {
    paddingVertical: 2,
    paddingLeft: Theme.spacing.s2,
  },
  equipmentName: {
    fontSize: 14,
    color: Theme.colors.textBody,
  },
  noEquipmentText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    fontStyle: "italic",
    paddingLeft: Theme.spacing.s2,
  },
  submitButton: {
    backgroundColor: Theme.colors.buttonBg,
    paddingVertical: 15,
    borderRadius: Theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: Theme.colors.primaryBorder,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: Theme.colors.primaryLight,
    opacity: 0.6,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: Theme.colors.buttonBg,
    padding: 12,
    borderRadius: Theme.radius.md,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  link: {
    paddingVertical: 12,
    backgroundColor: Theme.colors.primaryLight,
    alignItems: "center",
    borderRadius: Theme.radius.md,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Theme.colors.borderDefault,
  },
  linkText: {
    color: Theme.colors.textHeader,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TaskCheckScreen;
