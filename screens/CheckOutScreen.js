import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import CameraLocationComponent from "../components/CameraLocationComponent";
import useCheckInfo from "../services/UserContext";
import useAttendanceAndChecks from "../services/useAttendanceChecks";
import useFaceRecognition from "../services/useFaceRecog";
import CustomAlert from "../components/CustomAlert";

function CheckOutScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useCheckInfo();
  const { CheckOutAttendance } = useAttendanceAndChecks();
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
        if (user.role === "supervisor") {
          navigation.navigate("TaskCheck", {
            faceData: { ...data.matched_worker, image: photo.uri },
          });
        }
        const send = {
          subject_id: data.matched_worker?.person_id,
          image: photo.uri,
          is_unauthorized: false,
          is_work_completed: data.matched_worker.is_work_completed,
          is_equipment_returned: data.matched_worker.is_equipment_returned,
        };
        const checkOut = await CheckOutAttendance(send);
        showAlert("success", t(checkOut));
      } else {
        const send = {
          image: photo.uri,
          is_unauthorized: true,
        };
        const checkOut = await CheckOutAttendance(send);
        showAlert("error", t(checkOut));
      }
    } catch (error) {
      showAlert("error", error.message);
      //Debug console.error("Check-out process failed:", error);
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

export default CheckOutScreen;