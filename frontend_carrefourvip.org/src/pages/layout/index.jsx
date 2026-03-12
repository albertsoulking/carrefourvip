import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import useGoogleTranslateAutoInit from '../../hooks/useGoogleTranslateAutoInit';

const Layout = () => {
    useGoogleTranslateAutoInit();

    return (
        <Container
            maxWidth={'sm'}
            sx={{bgcolor: '#fff', border: '1px solid #e0e0e0'}}
            disableGutters>
            <Outlet />
        </Container>
    );
};

export default Layout;
