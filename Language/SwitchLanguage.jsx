import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from './i18n';
import { Theme } from '../constants/Theme';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文 (Chinese)' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'ar', label: '(Arabic) العربية' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'ru', label: 'Русский (Russian)' },
  { code: 'pt', label: 'Português (Portugese)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'bn', label: 'বাংলা (Bangla)' },
  { code: 'de', label: 'Deutsch (German)' },
  { code: 'ja', label: '日本語 (Japanese)' },
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
                <Text
                  style={[
                    styles.optionText,
                    i18n.language === lang.code && styles.selectedOptionText
                  ]}
                >
                  {lang.label}
                </Text>
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
    bottom: Theme.spacing.s6,
    right: Theme.spacing.s4,
    zIndex: 999,
  },
  dropdownButton: {
    backgroundColor: Theme.colors.buttonBg,
    paddingVertical: Theme.spacing.s2,
    paddingHorizontal: Theme.spacing.s4,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.primaryBorder,
  },
  dropdownButtonText: {
    color: Theme.colors.backgroundContainer,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.colors.backgroundContainer,
    padding: Theme.spacing.s6,
    borderTopLeftRadius: Theme.radius.lg,
    borderTopRightRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.borderDefault,
  },
  option: {
    paddingVertical: Theme.spacing.s3,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.borderDefault,
  },
  optionText: {
    fontSize: 16,
    color: Theme.colors.textBody,
  },
  selectedOptionText: {
    color: Theme.colors.primaryBorder,
    fontWeight: '700',
  },
});

export default SwitchLanguage;