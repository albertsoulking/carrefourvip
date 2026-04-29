import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import useGoogleTranslateAutoInit from '../../hooks/useGoogleTranslateAutoInit';

const Layout = () => {
    useGoogleTranslateAutoInit();

    return (
        <Container
            maxWidth={'sm'}
            sx={{
                minHeight: '100vh',
                bgcolor: 'var(--brand-cream)',
                borderLeft: '1px solid rgba(23, 57, 44, 0.08)',
                borderRight: '1px solid rgba(23, 57, 44, 0.08)',
                boxShadow: '0 0 60px rgba(23, 57, 44, 0.08)'
            }}
            disableGutters>
            <Outlet />
        </Container>
    );
};

export default Layout;
