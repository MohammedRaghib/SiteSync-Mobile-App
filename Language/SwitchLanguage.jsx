import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from './i18n';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
];

const SwitchLanguage = () => {
  const { i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (code) => {
    changeLanguage(code);
    setModalVisible(false);
  };

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.dropdownButtonText}>
          {LANGUAGES.find((l) => l.code === i18n.language)?.label || 'Select Language'}
        </Text>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={styles.option}
                onPress={() => handleSelect(lang.code)}
              >
                <Text style={styles.optionText}>{lang.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 999,
  },
  dropdownButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  dropdownButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  option: {
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default SwitchLanguage;