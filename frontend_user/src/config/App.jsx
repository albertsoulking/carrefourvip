import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@mui/material/styles';
import createBrandTheme, {
    defaultThemeMode,
    normalizeThemeMode,
    THEME_STORAGE_KEY
} from '../theme/brandTheme';
import ThemeModeContext from '../context/ThemeModeContext';
import ThemeSwitcher from '../components/ThemeSwitcher';

const App = () => {
    const [mode, setModeState] = useState(() =>
        normalizeThemeMode(localStorage.getItem(THEME_STORAGE_KEY) || defaultThemeMode)
    );
    const theme = useMemo(() => createBrandTheme(mode), [mode]);

    const setMode = (nextMode) => {
        setModeState(normalizeThemeMode(nextMode));
    };

    useEffect(() => {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
        document.documentElement.dataset.theme = mode;
    }, [mode]);

    return (
        <ThemeModeContext.Provider value={{ mode, setMode }}>
            <ThemeProvider theme={theme}>
                <SnackbarProvider
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}
                    maxSnack={3}
                    autoHideDuration={3000}
                    dense>
                    <BrowserRouter>
                        <Router />
                        {/* <ThemeSwitcher /> */}
                    </BrowserRouter>
                </SnackbarProvider>
            </ThemeProvider>
        </ThemeModeContext.Provider>
    );
};

export default App;
