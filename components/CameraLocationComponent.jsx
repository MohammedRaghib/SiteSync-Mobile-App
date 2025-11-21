import { useState, useEffect, useRef } from "react";
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import * as Location from "expo-location";
import { CameraView, useCameraPermissions } from "expo-camera";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";

const CameraLocationComponent = ({ onPictureTaken }) => {
  const { t } = useTranslation();
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [facing, setFacing] = useState("back");
  const cameraRef = useRef(null);
  const [IDModalVisible, setIDModalVisible] = useState(false);
  const [nationalID, setNationalID] = useState("");

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

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const openIDmodal = () => {
    setIDModalVisible(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      setIDModalVisible(false);

      try {
        const photo = await cameraRef.current.takePictureAsync();
        await onPictureTaken(photo, nationalID);
      } catch (error) {
        Alert.alert("An error occurred, please try again.");
      } finally {
        setLoading(false);
        setNationalID("");
      }
    }
  };

  if (!cameraPermission?.granted || !locationPermissionGranted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>{t("ui.AllPermissions")}</Text>
        <TouchableOpacity
          onPress={requestBothPermissions}
          style={styles.button}
        >
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
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {IDModalVisible && (
          <View style={styles.IDModalOverlay}>
            <View style={styles.IDModal}>
              <TextInput
                style={styles.IDModalInput}
                placeholder={t("ui.nationalIdNumber")}
                placeholderTextColor="#ccc"
                value={nationalID}
                onChangeText={(text) => setNationalID(text)}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIDModalVisible(false)}
              >
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.overlay}>
          <Text style={styles.infoText}>{t("ui.neutralExpression")}</Text>

          <View style={styles.bottomControls}>
            <TouchableOpacity
              onPress={toggleCameraFacing}
              style={styles.sideButton}
            >
              <Icon name="flip-camera-ios" size={36} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={takePicture}
              style={[styles.captureOuter, loading && styles.disabledButton]}
              disabled={loading}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <TouchableOpacity onPress={openIDmodal} style={styles.sideButton}>
              <Icon name="badge" size={36} color="#fff" />
            </TouchableOpacity>
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
    paddingVertical: 30,
  },
  infoText: {
    textAlign: "center",
    fontSize: 18,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingVertical: 8,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 20,
  },
  sideButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
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
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    padding: 10,
    marginBottom: 20,
    textAlign: "center",
    color: "#020101ff",
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  IDModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },

  IDModal: {
    width: "70%",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#555",
    alignItems: "center",
  },

  IDModalInput: {
    width: "100%",
    color: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#888",
    paddingVertical: 8,
    marginBottom: 15,
  },

  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 6,
  },
});

export default CameraLocationComponent;
