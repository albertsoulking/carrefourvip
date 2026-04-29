import { Box, Typography, Button } from '@mui/material';
import web from '../../routes/web';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import NotInterestedRoundedIcon from '@mui/icons-material/NotInterestedRounded';
import api from '../../routes/api';
import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export default function PaymentCancelPage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useSmartNavigate();
    const hasCalled = useRef(false);
    const [errorText, setErrorText] = useState(false);
    const [errorInvalid, setErrorInvalid] = useState(false);

    useEffect(() => {
        if (hasCalled.current) return;
        hasCalled.current = true;
        fetchData();
    }, []);

    const fetchData = async () => {
        const payload = {
            id: Number(id),
            status: 'cancelled',
            paymentStatus: 'cancelled'
        };

        try {
            await api.orders.updateStatus(payload);
        } catch (error) {
            if (error.status === 400) {
                setErrorInvalid(false);
                setErrorText(true);
            }

            if (error.status === 404) {
                setErrorInvalid(true);
                setErrorText(false);
            }

            enqueueSnackbar(
                Array.isArray(error.response?.data?.message)
                    ? error.response.data.message[0]
                    : error.response?.data?.message || error.message,
                {
                    variant: 'error'
                }
            );
        }
    };

    return (
        <Box
            textAlign={'center'}
            sx={{
                minHeight: '100vh',
                bgcolor: 'var(--brand-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2
            }}>
            <Box
                sx={{
                    width: '100%',
                    p: 3,
                    borderRadius: 'var(--brand-radius-xl)',
                    bgcolor: 'var(--brand-paper)',
                    border: '1px solid var(--brand-line)',
                    boxShadow: 'var(--brand-shadow)'
                }}>
            <HighlightOffRoundedIcon
                color={'error'}
                sx={{ fontSize: 80, display: errorInvalid ? 'none' : 'inline' }}
            />
            <NotInterestedRoundedIcon
                color={'action'}
                sx={{ fontSize: 80, display: errorInvalid ? 'inline' : 'none' }}
            />
            <Typography
                variant={'h4'}
                mt={2}>
                <span style={{ display: errorText ? 'inline' : 'none' }}>
                    {t('paymentResult.operationCompleted')}
                </span>
                <span
                    style={{
                        display: !errorText && !errorInvalid ? 'inline' : 'none'
                    }}>
                    {t('paymentResult.cancelTitle')}
                </span>
                <span style={{ display: errorInvalid ? 'inline' : 'none' }}>
                    {t('paymentResult.invalidLink')}
                </span>
            </Typography>
            <Typography
                variant={'body1'}
                mt={1}>
                <span style={{ display: errorText ? 'inline' : 'none' }}>
                    {t('paymentResult.cancelExpired')}
                </span>
                <span
                    style={{
                        display: !errorText && !errorInvalid ? 'inline' : 'none'
                    }}>
                    {t('paymentResult.cancelDescription')}
                </span>
                <span style={{ display: errorInvalid ? 'inline' : 'none' }}>
                    {t('paymentResult.invalidDescription')}
                </span>
            </Typography>
            <Button
                variant={errorInvalid ? 'outlined' : 'contained'}
                color={errorInvalid ? 'inherit' : 'error'}
                sx={{ mt: 4 }}
                onClick={() => navigate(web.home)}>
                {t('common.backToHome')}
            </Button>
            </Box>
        </Box>
    );
}
