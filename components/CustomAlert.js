import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

export default function CustomAlert({ visible, type, message, onClose }) {
  const colors = {
    error: "#ff4d4d",
    warning: "#ffcc00",
    success: "#4BB543",
    info: "#2196f3",
  };

  const backgroundColor = colors[type] || colors.success;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)"
      }}>
        <View style={{
          minWidth: 250,
          padding: 24,
          borderRadius: 10,
          backgroundColor,
          alignItems: "center"
        }}>
          <Text style={{ color: "#fff", fontSize: 16 }}>{message}</Text>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 18 }}>
            <Text style={{ color: "#fff", fontWeight: "bold", padding: 10 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}