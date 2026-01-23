import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import CameraLocationComponent from "../components/CameraLocationComponent";
import useAttendanceAndChecks from "../services/useAttendanceChecks";
import CustomAlert from "../components/CustomAlert";
import useCheckInfo from "../services/UserContext";
import log from "../components/Logger";

function CheckInScreen({ navigation }) {
  const { t } = useTranslation();
  const { loggedIn } = useCheckInfo();
  const { CheckInAttendance, handleAttendance } = useAttendanceAndChecks();

  const [alert, setAlert] = useState({
    visible: false,
    type: "success",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmText: "✔️",
    cancelText: "❌",
  });

  const showAlert = (type, message, onConfirm = null, onCancel = null) => {
    setAlert({
      visible: true,
      type,
      message,
      onConfirm,
      onCancel,
      confirmText: "✔️",
      cancelText: "❌",
    });
  };

  const closeAlert = () => setAlert((prev) => ({ ...prev, visible: false }));

  const processAttendanceAction = async (id, action, is_reentry = false) => {
    message = is_reentry ? "specialReEntry" : "checkin";
    closeAlert();
    const result = await handleAttendance(id, "checkin", action);
    if (!result.success) {
      showAlert("error", t(`errors.${action}AttendanceError`));
    } else if (action === "approve") {
      showAlert("success", t(`ui.${message}Confirmed`));
    }
  };

  const handlePictureTaken = async (photo) => {
    try {
      const send = {
        image: photo.uri,
      };
      const checkIn = await CheckInAttendance(send);

      if (checkIn?.success) {
        const message =
          t("ui.checkinVerify", {
            name: checkIn.subject_name,
          });

        showAlert(
          "info",
          message,
          () => processAttendanceAction(checkIn.attendance_id, "approve"),
          () => processAttendanceAction(checkIn.attendance_id, "delete"),
        );
      } else {
        if (checkIn.message.includes("await_supervisor_permission")) {
          log.info("Check In resp: ", checkIn);
          showAlert(
            "warning",
            t("errors.await_supervisor_permission", {
              name: checkIn.subject_name,
            }),
            () =>
              processAttendanceAction(checkIn.attendance_id, "approve", true),
            () =>
              processAttendanceAction(checkIn.attendance_id, "delete", true),
          );
          return;
        }
        throw new Error(t(checkIn?.message || "errors.fetchError"));
      }
    } catch (error) {
      const errorMsg = error.message.includes("Network request failed")
        ? t("errors.networkError")
        : error.message;
      showAlert("error", errorMsg);
    }
  };

  return (
    <View style={styles.container}>
      {loggedIn ? (
        <>
          <CameraLocationComponent onPictureTaken={handlePictureTaken} />
          <CustomAlert
            visible={alert.visible}
            type={alert.type}
            message={alert.message}
            onClose={closeAlert}
            onConfirm={alert.onConfirm}
            onCancel={alert.onCancel}
            confirmText={alert.confirmText}
            cancelText={alert.cancelText}
          />
        </>
      ) : (
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
  },
  link: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "blue",
  },
});

export default CheckInScreen;
