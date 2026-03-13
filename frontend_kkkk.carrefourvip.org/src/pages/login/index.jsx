import { Box } from '@mui/material';
import LoginForm from './LoginForm';
import { useEffect, useState } from 'react';
import TwoFactorForm from './TwoFactorForm';
import api from '../../routes/api';
import InitForm from './InitForm';

const backgroundImage =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';

const LoginPage = () => {
    const [loadingState, setLoadingState] = useState(true);
    const [isInit, setIsInit] = useState(false);
    const [form, setForm] = useState({
        page: 0,
        data: null
    });

    useEffect(() => {
        initWebsite();
    }, []);

    const initWebsite = async () => {
        try {
            const res = await api.utilities.ping();
            setIsInit(res.data.init);
            setLoadingState(false);
        } catch (error) {
            setIsInit(false);
            setLoadingState(false);
        }
    };

    return (
        <Box
            sx={{
                // minHeight: '100vh',
                minHeight: '100vh',
                minWidth: '100vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                p: 2
            }}>
            {!loadingState &&
                (isInit ? (
                    <InitForm setIsInit={setIsInit} />
                ) : (
                    <>
                        {form.page === 0 && <LoginForm setForm={setForm} />}
                        {form.page === 1 && (
                            <TwoFactorForm
                                data={form.data}
                                setForm={setForm}
                            />
                        )}
                    </>
                ))}
        </Box>
    );
};

export default LoginPage;
