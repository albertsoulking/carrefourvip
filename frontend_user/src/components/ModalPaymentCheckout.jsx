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
import PaypalCheckout from './PayPalCheckout';
import useStyledLocaleString from '../hooks/useStyledLocaleString';
import { useSmartNavigate } from '../hooks/useSmartNavigate';
import web from '../routes/web';
import useNotificationSocket from '../hooks/userNotificationSocket';
import StripeCheckout from './StripeCheckout';
import CardCheckout from './CardCheckout';
import LemonSqueezyCheckout from './LemonSqueezyCheckout';
import Pay2sCheckout from './Pay2sCheckout';
import StarPayCheckout from './StarPayCheckout';
import BehalfCheckout from './BehalfCheckout';
import WiseCheckout from './WiseCheckout';
import { useTranslation } from 'react-i18next';

export default function ModalPaymentCheckout({
    open,
    data,
    setOpen,
    paymentType,
    gateway
}) {
    const { t } = useTranslation();
    const navigate = useSmartNavigate();
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const [paymentLink, setPaymentLink] = useState(null);
    
    useNotificationSocket((noti) => {
        if (noti.type !== 'order') return;
        if (!open) return;
        if (noti.targetId !== data?.id) return;
        
        const extra = JSON.parse(noti.extra || '{}');
        if (paymentType === 'behalf') {
            setPaymentLink(extra.url);
        } else {
            setOpen({ open: false, data: null });
            window.location.href = extra.url;
        }
    });

    const handleOnPayLater = async () => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            setOpen({ open: false, data: null });
            navigate(web.orderDetail(data?.id));
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
                            display:
                                data?.payAmount === null ? 'none' : 'inline'
                        }}
                        translate={'no'}>
                        {useStyledLocaleString(data?.payAmount, user?.geoInfo)}
                    </span>
                </Typography>
                {gateway?.isManual === 1 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            my: 4
                        }}>
                        <CircularProgress />
                    </Box>
                ) : paymentType === 'paypal' ? (
                    <PaypalCheckout
                        amount={data?.payAmount}
                        orderId={data?.id}
                        setOpen={setOpen}
                        userId={user?.id}
                        config={gateway?.config}
                    />
                ) : paymentType === 'stripe' ? (
                    <StripeCheckout
                        orderId={data?.id}
                        price={Math.round(Number(data?.payAmount) * 100)}
                        name={data?.userName}
                        config={gateway?.config}
                    />
                ) : paymentType === 'card' ? (
                    <CardCheckout
                        orderId={data?.id}
                        setOpen={setOpen}
                        config={gateway?.config}
                    />
                ) : paymentType === 'lemon' ? (
                    <LemonSqueezyCheckout />
                ) : paymentType === 'pay2s' ? (
                    <Pay2sCheckout orderId={data?.id} />
                ) : paymentType === 'starpay' ? (
                    <StarPayCheckout
                        open={open}
                        data={data}
                    />
                ) : paymentType === 'behalf' ? (
                    <BehalfCheckout
                        orderId={data?.id}
                        paymentLink={paymentLink}
                    />
                ) : paymentType === 'wise' ? (
                    <WiseCheckout />
                ) : paymentType === 'faf' ? (
                    <></>
                ) : (
                    <Box textAlign={'center'}>
                        <Typography>{t('payment.gatewayUnavailable')}</Typography>
                    </Box>
                )}
                {gateway?.isManual === 1 && (
                    <>
                        <Box textAlign={'center'}>
                            <Button
                                size={'small'}
                                sx={{ textDecoration: 'underline !important' }}
                                onClick={() => {
                                    setOpen({ open: false, data: null });
                                    navigate(web.orderDetail(data?.id));
                                }}>
                                {t('payment.goToOrderDetail')}
                            </Button>
                        </Box>
                        <Typography
                            textAlign={'center'}
                            fontSize={12}>
                            {t('payment.redirecting')}
                        </Typography>
                    </>
                )}
                <Typography
                    textAlign={'center'}
                    fontSize={12}
                    mt={1}>
                    {t('payment.orderId')}: <span translate={'no'}>#{data?.id}</span>
                </Typography>
            </Box>
        </Dialog>
    );
}
