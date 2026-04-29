import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@mui/material/styles';
import brandTheme from '../theme/brandTheme';

const App = () => {
    return (
        <ThemeProvider theme={brandTheme}>
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
                </BrowserRouter>
            </SnackbarProvider>
        </ThemeProvider>
    );
};

export default App;
