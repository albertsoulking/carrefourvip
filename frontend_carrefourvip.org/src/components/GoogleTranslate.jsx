import { useEffect } from 'react';
import useLang from '../hooks/useLang';

export default function GoogleTranslate() {
    const changeLanguage = useLang();

    useEffect(() => {
        if (document.getElementById('google-translate-script')) return;
        if (window.googleTranslateElementInit) return;

        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'en',
                    autoDisplay: false
                },
                'google_translate_element'
            );
        };

        setTimeout(() => {
            const browserLang = navigator.language || navigator.userLanguage;
            const savedLang = localStorage.getItem('i18nextLng');
            
            changeLanguage(savedLang ?? browserLang);
        }, 500);
        
        const script = document.createElement('script');
        script.src =
            'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    return (
        <div
            id='google_translate_element'
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: -9999,
                opacity: 0,
                pointerEvents: 'none'
            }}
        />
    );
}
