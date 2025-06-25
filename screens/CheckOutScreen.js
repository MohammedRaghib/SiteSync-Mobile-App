import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
import CameraLocationComponent from "../components/CameraLocationComponent";
import useCheckInfo from "../services/UserContext";
import useAttendanceAndChecks from "../services/useAttendanceChecks";
import useFaceRecognition from "../services/useFaceRecog";

function CheckInScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useCheckInfo();
  const { CheckOutAttendance } = useAttendanceAndChecks();
  const { recognizeFace } = useFaceRecognition();

  const handlePictureTaken = async (photo) => {
    try {
      const data = await recognizeFace(photo.uri);

      if (data.matchFound) {
        if (user.role === "supervisor") navigation.navigate("TaskCheck", { faceData: { ...data.matched_worker, image: photo.uri } });

        const send = {
          ...data.matched_worker,
          image: photo.uri,
          is_unauthorized: false,
          is_work_completed: data.matched_worker.is_work_completed,
          is_equipment_returned: data.matched_worker.is_equipment_returned
        };
        const checkOut = CheckOutAttendance(send);
        Alert.alert(t(checkOut));
      } else {
        const send = {
          image: photo.uri,
          is_unauthorized: true
        };
        const checkOut = CheckOutAttendance(send);
        Alert.alert(t(checkOut));
      }
    } catch (error) {
      Alert.alert(error.message);
      console.error("Check-out process failed:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraLocationComponent onPictureTaken={handlePictureTaken} />
    </View>
  );
}

export default CheckInScreen;
