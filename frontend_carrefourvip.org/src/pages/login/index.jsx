import { useState, useEffect } from 'react';
import { Box, Button, Container, Dialog, IconButton } from '@mui/material';
import web from '../../routes/web';
import FormSection from './FormSection';
import { ArrowBackIosNewRounded, LanguageRounded } from '@mui/icons-material';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const LoginPage = () => {
    const navigate = useSmartNavigate();
    const [openLanguage, setOpenLanguage] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            navigate(web.home);
            return;
        }
    }, []);

    return (
        <Container
            maxWidth={'false'}
            sx={{ p: '0 !important', position: 'relative', translate: 'no' }}>
            <Box
                display={'flex'}
                alignItems={'center'}
                flexDirection={'column'}>
                <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    width={'100%'}>
                    <Button
                        size={'small'}
                        startIcon={
                            <ArrowBackIosNewRounded fontSize={'small'} />
                        }
                        onClick={() => navigate(web.home)}>
                        Home
                    </Button>
                    <IconButton
                        color={'primary'}
                        onClick={() => setOpenLanguage(true)}>
                        <LanguageRounded fontSize={'small'} />
                    </IconButton>
                </Box>
                <FormSection />
            </Box>
            <Dialog
                PaperProps={{
                    sx: {
                        width: 300,
                        maxWidth: 600,
                        m: 1
                    }
                }}
                open={openLanguage}
                onClose={() => setOpenLanguage(false)}>
                <LanguageSwitcher setOpen={setOpenLanguage} />
            </Dialog>
        </Container>
    );
};

export default LoginPage;
