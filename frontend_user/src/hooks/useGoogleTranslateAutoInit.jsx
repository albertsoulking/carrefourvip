// hooks/useGoogleTranslateAutoInit.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useLang from './useLang';

export default function useGoogleTranslateAutoInit() {
    const location = useLocation();
    const changeLanguage = useLang();

    useEffect(() => {
        const checkAndInit = () => {
            const select = document.querySelector('.goog-te-combo');
            
            if (!select && window.google?.translate?.TranslateElement) {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        layout: window.google.translate.TranslateElement
                            .InlineLayout.SIMPLE
                    },
                    'google_translate_element'
                );
            }
        };

        setTimeout(() => {
            const browserLang = navigator.language || navigator.userLanguage;
            const savedLang = localStorage.getItem('i18nextLng');
            
            changeLanguage(savedLang ?? browserLang);
        }, 500);

        const interval = setInterval(checkAndInit, 500);
        setTimeout(() => clearInterval(interval), 5000);

        return () => clearInterval(interval);
    }, [location]);
}
