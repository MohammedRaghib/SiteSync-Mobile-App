import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Alert, Text, View } from "react-native";
import CameraLocationComponent from "../components/CameraLocationComponent";
import useAttendanceAndChecks from "../services/useAttendanceChecks";
import useFaceRecognition from "../services/useFaceRecog";

function CheckInScreen() {
  const { t } = useTranslation();
  const { CheckInAttendance } = useAttendanceAndChecks();
  const { recognizeFace } = useFaceRecognition();

  const handlePictureTaken = async (photo) => {
    try {
      const data = await recognizeFace(photo.uri);

      if (data.success) {
        const send = {
          ...data.matched_worker,
          image: photo.uri,
          is_unauthorized: false,
        };
        const checkIn = CheckInAttendance(send);
        Alert.alert(t(checkIn));
      } else {
        const send = {
          image: photo.uri,
          is_unauthorized: true,
        };
        const checkIn = CheckInAttendance(send);
        Alert.alert(t(checkIn));
      }
    } catch (error) {
      Alert.alert(error.message);
      console.error("Check-in process failed:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraLocationComponent onPictureTaken={handlePictureTaken} />
    </View>
  );
}

export default CheckInScreen;
