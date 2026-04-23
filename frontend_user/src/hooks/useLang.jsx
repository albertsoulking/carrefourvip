import { useTranslation } from 'react-i18next';

const useLang = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);

        const select = document.querySelector('.goog-te-combo');
        if (!select) return;

        const currentLang = select.value;

        // 模拟重新选择当前语言
        select.value = '';
        select.dispatchEvent(new Event('change'));

        setTimeout(() => {
            select.value = langCode;
            select.dispatchEvent(new Event('change'));
        }, 50);
        console.log('Language changed to:', langCode);
        document.cookie = `googtrans=/en/${langCode}; path=/`;
        document.cookie = `googtrans=/en/${langCode}; domain=${window.location.hostname}; path=/`;
    };

    return changeLanguage;
};

export default useLang;
