import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import CameraLocationComponent from "../components/CameraLocationComponent";
import useAttendanceAndChecks from "../services/useAttendanceChecks";
import useFaceRecognition from "../services/useFaceRecog";
import CustomAlert from "../components/CustomAlert";

function CheckInScreen() {
  const { t } = useTranslation();
  const { CheckInAttendance } = useAttendanceAndChecks();
  const { recognizeFace } = useFaceRecognition();

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
      const data = await recognizeFace(photo.uri);

      if (data.matchFound) {
        const send = {
          subject_id: data.matched_worker?.person_id,
          image: photo.uri,
          is_unauthorized: false,
        };
        const checkIn = await CheckInAttendance(send);
        showAlert("success", t(checkIn));
      } else {
        const send = {
          image: photo.uri,
          is_unauthorized: true,
        };
        const checkIn = await CheckInAttendance(send);
        showAlert("error", t(checkIn));
      }
    } catch (error) {
      showAlert("error", error.message);
      //Debug console.error("Check-in process failed:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraLocationComponent onPictureTaken={handlePictureTaken} />
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        message={alert.message}
        onClose={closeAlert}
      />
    </View>
  );
}

export default CheckInScreen;