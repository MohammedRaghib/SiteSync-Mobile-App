import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import CameraLocationComponent from "../components/CameraLocationComponent";
import useCheckInfo from "../services/UserContext";
import useAttendanceAndChecks from "../services/useAttendanceChecks";
import useFaceRecognition from "../services/useFaceRecog";
import CustomAlert from "../components/CustomAlert";
import log from "../components/Logger";

function CheckOutScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, loggedIn } = useCheckInfo();
  const { CheckOutAttendance, handleAttendance } = useAttendanceAndChecks();
  const { recognizeFace } = useFaceRecognition();

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

  const processAttendanceAction = async (id, action) => {
    closeAlert();
    const result = await handleAttendance(id, "checkout", action);
    if (!result.success) {
      showAlert("error", t(`errors.${action}AttendanceError`));
    } else if (action === "approve") {
      showAlert("success", t("ui.checkoutConfirmed"));
    }
  };

  const handlePictureTaken = async (photo) => {
    try {
      if (user.role === "supervisor") {
        const data = await recognizeFace(photo.uri);
        log.info("🔍 Face recognition data:", data);

        if (data.matchFound) {
          navigation.navigate("TaskCheck", {
            faceData: { ...data.matchedPerson, image: photo.uri },
          });
          return;
        } else {
          throw new Error(t("errors.subject_not_found"));
        }
      }

      const send = { image: photo.uri };
      const checkOut = await CheckOutAttendance(send);

      if (checkOut.success) {
        const message =
          t("ui.checkoutVerify", {
            name: checkOut.subject_name,
          }) || `Confirm check-out for ${checkOut.subject_name}?`;

        showAlert(
          "info",
          message,
          () => processAttendanceAction(checkOut.attendance_id, "approve"),
          () => processAttendanceAction(checkOut.attendance_id, "delete"),
        );
      } else {
        throw new Error(t(checkOut?.message || "errors.fetchError"));
      }
    } catch (error) {
      const errorMessage = error.message.includes("Network request failed")
        ? t("errors.networkError")
        : error.message;
      showAlert("error", errorMessage);
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
    color: "#2196f3",
  },
});

export default CheckOutScreen;
