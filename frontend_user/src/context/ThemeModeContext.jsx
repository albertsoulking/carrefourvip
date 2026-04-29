import { createContext, useContext } from 'react';
import { defaultThemeMode } from '../theme/brandTheme';

const ThemeModeContext = createContext({
    mode: defaultThemeMode,
    setMode: () => {}
});

export const useThemeMode = () => useContext(ThemeModeContext);

export default ThemeModeContext;
