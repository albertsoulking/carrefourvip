import { useEffect } from 'react';
import { Box, Button } from '@mui/material';
import useLang from '../hooks/useLang';

const LANGUAGE_LIST = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'es', label: 'Español' },
    { code: 'ga', label: 'Gaeilge' },
    { code: 'be', label: 'Беларуская' },
    { code: 'bs', label: 'Bosanski' },
    { code: 'bg', label: 'Български' },
    { code: 'ca', label: 'Català' },
    { code: 'hr', label: 'Hrvatski' },
    { code: 'cs', label: 'Čeština' },
    { code: 'da', label: 'Dansk' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'eo', label: 'Esperanto' },
    { code: 'et', label: 'Eesti' },
    { code: 'fi', label: 'Suomi' },
    { code: 'el', label: 'Ελληνικά' },
    { code: 'kk', label: 'Қазақ тілі' },
    { code: 'lv', label: 'Latviešu' },
    { code: 'lt', label: 'Lietuvių' },
    { code: 'lb', label: 'Lëtzebuergesch' },
    { code: 'mk', label: 'Македонски' },
    { code: 'no', label: 'Norsk' },
    { code: 'pl', label: 'Polski' },
    { code: 'pt', label: 'Português' },
    { code: 'ro', label: 'Română' },
    { code: 'ru', label: 'Русский' },
    { code: 'sv', label: 'Svenska' },
    { code: 'uk', label: 'Українська' },
    { code: 'zh-CN', label: '简体中文' },
    // { code: 'my', label: 'မြန်မာ' }
];

export default function LanguageSwitcher({ setOpen }) {
    const changeLanguage = useLang();

    useEffect(() => {
        const interval = setInterval(() => {
            const select = document.querySelector('.goog-te-combo');

            if (select && window.google && window.google.translate)
                clearInterval(interval);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <Box>
            {LANGUAGE_LIST.map(({ code, label }) => (
                <Button
                    key={code}
                    fullWidth
                    size={'small'}
                    sx={{ fontSize: 16, textTransform: 'capitalize' }}
                    onClick={(e) => {
                        setOpen(false);
                        changeLanguage(code);
                    }}
                    translate={'no'}>
                    {label}
                </Button>
            ))}
        </Box>
    );
}
