import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import { SnackbarProvider } from 'notistack';

const App = () => {
    return (
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
    );
};

export default App;
