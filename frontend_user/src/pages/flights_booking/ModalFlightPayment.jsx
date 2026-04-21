import { CloseRounded } from '@mui/icons-material';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    IconButton,
    Typography
} from '@mui/material';
import { useState } from 'react';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import web from '../../routes/web';
import useNotificationSocket from '../../hooks/userNotificationSocket';
import { useTranslation } from 'react-i18next';

export default function ModalFlightPayment({ open, data, setOpen }) {
    const { t } = useTranslation();
    const navigate = useSmartNavigate();
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const [paymentLink, setPaymentLink] = useState(null);

    useNotificationSocket((noti) => {
        if (noti.type !== 'flight_booking') return;
        if (!open) return;
        if (noti.targetId !== data?.id) return;

        const extra = JSON.parse(noti.extra || '{}');
        setOpen({ open: false, data: null });
        window.location.href = extra.url;
    });

    const handleOnPayLater = async () => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            setOpen({ open: false, data: null });
        }, 500);
    };

    return (
        <Dialog
            open={open}
            maxWidth={false}
            PaperProps={{
                sx: { width: '100vw', maxWidth: 450 }
            }}
            disableEnforceFocus>
            <Box sx={{ bgcolor: '#fafafa', borderRadius: 2, p: 2 }}>
                <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    justifyItems={'center'}>
                    <IconButton
                        sx={{
                            width: '100%',
                            inlineSize: 'auto'
                        }}
                        disabled>
                        <CloseRounded sx={{ color: '#fafafa' }} />
                    </IconButton>
                    <Typography
                        fontSize={24}
                        fontWeight={'bold'}
                        textAlign={'center'}
                        lineHeight={2}>
                        {t('payment.title')}
                    </Typography>
                    <IconButton
                        sx={{
                            width: '100%',
                            inlineSize: 'auto'
                        }}
                        color={'error'}
                        loading={loading}
                        onClick={handleOnPayLater}>
                        <CloseRounded />
                    </IconButton>
                </Box>
                <Typography
                    fontSize={24}
                    fontWeight={'bold'}
                    textAlign={'center'}
                    mb={1}>
                    <span
                        style={{
                            display: data?.price === null ? 'none' : 'inline'
                        }}
                        translate={'no'}>
                        {useStyledLocaleString(data?.price, user?.geoInfo)}
                    </span>
                </Typography>
                {data?.paymentLink === null ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            my: 4
                        }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box textAlign={'center'}>
                        <Typography>
                            {t('payment.gatewayUnavailable')}
                        </Typography>
                    </Box>
                )}
                <Typography
                    textAlign={'center'}
                    fontSize={12}>
                    {t('payment.redirecting')}
                </Typography>
                <Typography
                    textAlign={'center'}
                    fontSize={12}
                    mt={1}>
                    {t('payment.orderId')}:{' '}
                    <span translate={'no'}>#{data?.id}</span>
                </Typography>
            </Box>
        </Dialog>
    );
}
