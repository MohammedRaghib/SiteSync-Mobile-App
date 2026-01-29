import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Theme } from "../constants/Theme";

const { width } = Dimensions.get("window");

export default function CustomAlert({
  visible,
  type,
  message,
  onClose,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  const colors = {
    error: Theme.colors.dangerBorder,
    warning: "#F59E0B",
    success: Theme.colors.primaryBorder,
    info: "#3B82F6",
  };

  const themeColor = colors[type] || colors.success;

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.headerStrip, { backgroundColor: themeColor }]} />

          <View style={styles.content}>
            <Text style={styles.messageText}>{message}</Text>

            <View style={styles.buttonContainer}>
              {onConfirm ? (
                <>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={[styles.button, styles.cancelButton]}
                  >
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onConfirm}
                    style={[styles.button, { backgroundColor: themeColor }]}
                  >
                    <Text style={styles.confirmButtonText}>{confirmText}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.button,
                    { backgroundColor: themeColor, width: "100%" },
                  ]}
                >
                  <Text style={styles.confirmButtonText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: Theme.colors.backgroundContainer,
    borderRadius: Theme.radius.lg,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerStrip: {
    height: 8,
    width: "100%",
  },
  content: {
    padding: Theme.spacing.s6,
    paddingTop: Theme.spacing.s6 * 1.5,
    alignItems: "center",
  },
  messageText: {
    color: Theme.colors.textBody,
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: Theme.spacing.s6,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: Theme.spacing.s3,
  },
  button: {
    flex: 1,
    paddingVertical: Theme.spacing.s3,
    borderRadius: Theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: Theme.colors.secondaryLight,
    borderWidth: 1,
    borderColor: Theme.colors.borderDefault,
  },
  cancelButtonText: {
    color: Theme.colors.textMuted,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
