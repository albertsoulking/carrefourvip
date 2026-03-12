import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';
import zh from '../locales/zh.json'; // 中文

i18n.use(LanguageDetector) // 自动检测用户语言
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            zh: { translation: zh }
        },
        fallbackLng: 'en', // 默认语言
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator'], // 从 localStorage 和浏览器检测语言
            caches: ['localStorage']
        }
    });

export default i18n;
