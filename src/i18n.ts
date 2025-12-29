import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// JSON fayllarini keyinchalik bitta-bitta to'ldiramiz
import uz from './locales/uz.json';
import ru from './locales/ru.json';
import tj from './locales/tj.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector) // Brauzerdagi tilni avtomat aniqlash uchun
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      ru: { translation: ru },
      tj: { translation: tj },
      en: { translation: en },
    },
    fallbackLng: 'uz', // Agar til topilmasa, o'zbek tili chiqadi
    interpolation: {
      escapeValue: false, // React XSS'dan o'zi himoyalangan
    },
  });

export default i18n;