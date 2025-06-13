import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// import { getCountry, getLanguageCode } from 'react-native-localize';

import en from './en.json';
import zh from './zh.json';

const resources = { en: { translation: en }, zh: { translation: zh } };

// const languageCode = getLanguageCode() || 'en';
// const countryCode = getCountry() || 'US'; 

i18n.use(initReactI18next).init({
  resources,
  lng: 'en', 
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
}).then(() => {
  console.log(`i18n initialized with language: ${i18n.language}`);
}).catch((error) => {
  console.error('Error initializing i18n:', error);
});

export const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
};

export default i18n;