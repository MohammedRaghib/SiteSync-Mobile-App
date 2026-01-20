import { useState, useEffect, useRef } from "react";
import { Alert, Text, TouchableOpacity, View, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { CameraView, useCameraPermissions } from "expo-camera";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { Theme } from "../constants/Theme";

const CameraLocationComponent = ({ onPictureTaken }) => {
  const { t } = useTranslation();
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [facing, setFacing] = useState("back");
  const cameraRef = useRef(null);

  const requestBothPermissions = async () => {
    const camPermission = await requestCameraPermission();
    if (!camPermission.granted) {
      Alert.alert(t("ui.error"), "Camera access is required!");
      return;
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("ui.error"), "Location access is required!");
      return;
    }

    setLocationPermissionGranted(true);
  };

  useEffect(() => {
    requestBothPermissions();
  }, []);

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync();
        await onPictureTaken(photo);
      } catch (error) {
        Alert.alert(t("ui.error"), "An error occurred, please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!cameraPermission?.granted || !locationPermissionGranted) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="security" size={64} color={Theme.colors.primaryBorder} />
        <Text style={styles.permissionText}>{t("ui.AllPermissions")}</Text>
        <TouchableOpacity onPress={requestBothPermissions} style={styles.button}>
          <Text style={styles.buttonText}>{t("ui.grantPermission")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Theme.colors.backgroundContainer} />
          </View>
        )}

        <View style={styles.overlay}>
          <Text style={styles.infoText}>{t("ui.neutralExpression")}</Text>

          <View style={styles.bottomControls}>
            <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipButton}>
              <Icon name="flip-camera-ios" size={36} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={takePicture}
              style={[styles.captureOuter, loading && styles.disabledButton]}
              disabled={loading}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <View style={{ width: 50 }} />
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: Theme.spacing.s6,
  },
  infoText: {
    textAlign: "center",
    fontSize: 18,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: Theme.spacing.s2,
    marginHorizontal: Theme.spacing.s4,
    borderRadius: Theme.radius.md,
    overflow: 'hidden',
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: Theme.spacing.s6,
  },
  flipButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: Theme.spacing.s2,
    borderRadius: 50,
  },
  captureOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  disabledButton: {
    opacity: 0.5,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Theme.spacing.s6,
    backgroundColor: Theme.colors.backgroundBody,
  },
  permissionText: {
    fontSize: 18,
    padding: Theme.spacing.s2,
    marginBottom: Theme.spacing.s4,
    textAlign: "center",
    color: Theme.colors.textHeader,
  },
  button: {
    backgroundColor: Theme.colors.buttonBg,
    paddingVertical: Theme.spacing.s3,
    paddingHorizontal: Theme.spacing.s6,
    borderRadius: Theme.radius.md,
  },
  buttonText: {
    color: Theme.colors.backgroundContainer,
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});

export default CameraLocationComponent;