import { Box, Typography, Button } from '@mui/material';
import web from '../../routes/web';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import NotInterestedRoundedIcon from '@mui/icons-material/NotInterestedRounded';
import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import api from '../../routes/api';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export default function PaymentSuccessPage() {
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
            status: 'pending',
            paymentStatus: 'paid'
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
                    borderRadius: '28px',
                    bgcolor: '#fffdfa',
                    border: '1px solid var(--brand-line)',
                    boxShadow: 'var(--brand-shadow)'
                }}>
            <CheckCircleOutlineRoundedIcon
                color={'success'}
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
                    {t('paymentResult.successTitle')}
                </span>
                <span style={{ display: errorInvalid ? 'inline' : 'none' }}>
                    {t('paymentResult.invalidLink')}
                </span>
            </Typography>
            <Typography
                variant={'body1'}
                mt={1}>
                <span style={{ display: errorText ? 'inline' : 'none' }}>
                    {t('paymentResult.successExpired')}
                </span>
                <span
                    style={{
                        display: !errorText && !errorInvalid ? 'inline' : 'none'
                    }}>
                    {t('paymentResult.successDescription')}
                </span>
                <span style={{ display: errorInvalid ? 'inline' : 'none' }}>
                    {t('paymentResult.invalidDescription')}
                </span>
            </Typography>
            <Button
                variant={errorInvalid ? 'outlined' : 'contained'}
                color={errorInvalid ? 'inherit' : 'primary'}
                sx={{ mt: 4 }}
                onClick={() => navigate(web.home)}>
                {t('common.backToHome')}
            </Button>
            </Box>
        </Box>
    );
}
