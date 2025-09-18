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
  const { user, loggedIn } = useCheckInfo();
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
      if (user.role === "supervisor") {
        const data = await recognizeFace(photo.uri);

        if (data.matchFound) {
          navigation.navigate("TaskCheck", {
            faceData: { ...data.matchedPerson, image: photo.uri },
          });
          return;
        }
      }

      const send = {
        image: photo.uri,
      };

      const checkOut = await CheckOutAttendance(send);

      if (!checkOut.success) {
        throw new Error(t(checkOut?.message || "errors.fetchError"));
      }

      showAlert("success", t(checkOut.message || "attendance.checkoutSuccess"));
    } catch (error) {
      if (error.message.includes("Network request failed")) {
        showAlert("error", t("errors.networkError"));
      } else {
        showAlert("error", error.message);
      }
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

export default CheckOutScreen;