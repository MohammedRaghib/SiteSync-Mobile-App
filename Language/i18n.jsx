import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import zh from './zh.json';
import es from './es.json';
import ar from './ar.json';
import fr from './fr.json';
import ru from './ru.json';
import pt from './pt.json';
import hi from './hi.json';
import bn from './bn.json';
import de from './de.json';
import ja from './ja.json';

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  es: { translation: es },
  ar: { translation: ar },
  fr: { translation: fr },
  ru: { translation: ru },
  pt: { translation: pt },
  hi: { translation: hi },
  bn: { translation: bn },
  de: { translation: de },
  ja: { translation: ja }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })
  .then(() => {
    console.log(`i18n initialized with language: ${i18n.language}`);
  })
  .catch((error) => {
    console.error('Error initializing i18n:', error);
  });

export const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
};

export default i18n;