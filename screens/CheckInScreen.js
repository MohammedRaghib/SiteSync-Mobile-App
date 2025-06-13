import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from "react-native";
import CameraLocationComponent from "../components/CameraLocationComponent";


function CheckInScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

const handlePictureTaken = null;

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ textAlign: "center" }}>{t("neutralExpression")}</Text>
      <CameraLocationComponent onPictureTaken={handlePictureTaken} />
    </View>
  );
}

export default CheckInScreen;