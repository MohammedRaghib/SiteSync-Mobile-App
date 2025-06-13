import { useState, useEffect, useRef } from "react";
import { Alert, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useTranslation } from "react-i18next";

const CameraLocationComponent = ({ onPictureTaken }) => {
  const { t } = useTranslation();
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const requestBothPermissions = async () => {
    const camPermission = await requestCameraPermission();
    if (!camPermission.granted) {
      Alert.alert("Camera access is required!");
      return;
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Location access is required!");
      return;
    }

    setLocationPermissionGranted(true);
  };

  useEffect(() => {
    requestBothPermissions();
  }, []);

  if (!cameraPermission?.granted || !locationPermissionGranted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>{t("ui.AllPermissions")}</Text>
        <TouchableOpacity onPress={requestBothPermissions} style={styles.button}>
          <Text style={styles.buttonText}>{t("ui.grantPermission")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        onPictureTaken(photo);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("An error occurred, please try again.");
      }
    } else {
      console.log("Camera not available");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.info}>{t("ui.neutralExpression")}</Text>
      <CameraView ref={cameraRef} style={styles.camera} />
      <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
        <Text style={styles.buttonText}>{t("ui.capturePhoto")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    paddingVertical: 20,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  captureButton: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 50,
  },
});

export default CameraLocationComponent;