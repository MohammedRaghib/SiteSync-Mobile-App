import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import CameraLocationComponent from "../components/CameraLocationComponent";
import useAttendanceAndChecks from "../services/useAttendanceChecks";
import CustomAlert from "../components/CustomAlert";
import useCheckInfo from "../services/UserContext";

function CheckInScreen() {
  const { t } = useTranslation();
  const { loggedIn } = useCheckInfo();
  const { CheckInAttendance } = useAttendanceAndChecks();

  const [alert, setAlert] = useState({
    visible: false,
    type: "success",
    message: "",
  });

  const showAlert = (type, message) => {
    setAlert({
      visible: true,
      type,
      message,
    });
  };

  const closeAlert = () => setAlert({ ...alert, visible: false });

  const handlePictureTaken = async (photo) => {
    try {
      const send = {
        image: photo.uri,
      };
      const checkIn = await CheckInAttendance(send);

      if (!checkIn?.success){
        throw new Error(t(checkIn?.message || "errors.fetchError" ));
      }

      showAlert("success", t(checkIn?.message || "attendance.checkinSuccess"));
    } catch (error) {
      showAlert("error", error.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {loggedIn && (
        <>
          <CameraLocationComponent onPictureTaken={handlePictureTaken} />
          <CustomAlert
            visible={alert.visible}
            type={alert.type}
            message={alert.message}
            onClose={closeAlert}
          />
        </>
      )}
      {!loggedIn && (
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.text}>{t("ui.login")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default CheckInScreen;