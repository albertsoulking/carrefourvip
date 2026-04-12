import { Box, Typography, Button, Divider } from '@mui/material';
import web from '../../routes/web';
import {
    CheckCircleOutlineRounded,
    HighlightOffRounded
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { Trans, useTranslation } from 'react-i18next';

export default function PaymentPay2sPage() {
    const { t } = useTranslation();
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useSmartNavigate();
    const [searchParams] = useSearchParams();
    const amount = searchParams.get('amount');
    const message = searchParams.get('message');
    const orderId = searchParams.get('orderId');
    const orderInfo = searchParams.get('orderInfo');
    const orderType = searchParams.get('orderType');
    const payType = searchParams.get('payType');
    const responseTime = searchParams.get('responseTime');
    const resultCode = searchParams.get('resultCode');

    return (
        <Box
            textAlign={'center'}
            mt={10}>
            {resultCode === '0' ? (
                <CheckCircleOutlineRounded
                    color={'success'}
                    sx={{ fontSize: 80 }}
                />
            ) : (
                <HighlightOffRounded
                    color={'error'}
                    sx={{ fontSize: 80 }}
                />
            )}
            <Typography
                variant={'h6'}
                mt={1}>
                {message}
            </Typography>
            <Typography
                variant={'h4'}
                fontWeight={'bold'}
                mt={2}>
                {useStyledLocaleString(amount, user?.geoInfo)}
            </Typography>
            <Divider sx={{ width: '90%', m: '0 auto', my: 2 }} />
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                mx={3}>
                <Typography variant={'body2'}>{t('payment.orderId')}:</Typography>
                <Typography
                    variant={'body2'}
                    sx={{ float: 'right' }}>
                    #{orderId}
                </Typography>
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                mx={3}>
                <Typography variant={'body2'}>{t('payment.pay2s.orderInfo')}:</Typography>
                <Typography
                    variant={'body2'}
                    sx={{ float: 'right' }}>
                    {orderInfo}
                </Typography>
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                mx={3}>
                <Typography variant={'body2'}>{t('payment.pay2s.orderType')}:</Typography>
                <Typography
                    variant={'body2'}
                    sx={{ float: 'right' }}>
                    {orderType}
                </Typography>
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                mx={3}>
                <Typography variant={'body2'}>{t('payment.pay2s.payType')}:</Typography>
                <Typography
                    variant={'body2'}
                    sx={{ float: 'right' }}>
                    {payType}
                </Typography>
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                mx={3}>
                <Typography variant={'body2'}>{t('payment.pay2s.responseTime')}:</Typography>
                <Typography
                    variant={'body2'}
                    sx={{ float: 'right' }}>
                    {new Date(responseTime * 1000).toLocaleString()}
                </Typography>
            </Box>
            <Typography
                variant={'body1'}
                mt={1}
                p={1}>
                <Trans
                    i18nKey={'paymentSubmit.checkOrderDetail'}
                    components={{ br: <br />, strong: <strong /> }}
                />
            </Typography>
            <Button
                variant={'contained'}
                color={'primary'}
                sx={{ mt: 4 }}
                onClick={() => navigate(web.home)}>
                {t('common.backToHome')}
            </Button>
        </Box>
    );
}
