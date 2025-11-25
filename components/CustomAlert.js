import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

export default function CustomAlert({ visible, type, message, onClose }) {
  const backgroundColor = type === "error" ? "#ff4d4d" : "#4CAF50";

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