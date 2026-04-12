import { Box, Typography } from '@mui/material';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import { useTranslation } from 'react-i18next';

const PaymentItem = ({
    subtotal,
    deliveryFee,
    total,
    payAmount,
    discount,
    vat
}) => {
    const { t } = useTranslation();
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <Box sx={{ mb: 2 }}>
            <Typography
                variant={'body1'}
                fontWeight={'bold'}>
                {t('orderDetail.payment.title')}
            </Typography>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>{t('orderDetail.payment.subtotal')}:</Typography>
                <Typography
                    variant={'body2'}
                    textAlign={'right'}
                    translate={'no'}>
                    {useStyledLocaleString(subtotal, user?.geoInfo)}
                </Typography>
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>{t('orderDetail.payment.deliveryFee')}:</Typography>
                <Typography
                    variant={'body2'}
                    textAlign={'right'}
                    translate={'no'}>
                    {useStyledLocaleString(deliveryFee, user?.geoInfo)}
                </Typography>
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>
                    {t('orderDetail.payment.vat')}(
                    {subtotal === 0
                        ? '0.00'
                        : ((vat / subtotal) * 100).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                          })}
                    %):
                </Typography>
                <Typography
                    variant={'body2'}
                    textAlign={'right'}
                    translate={'no'}>
                    {useStyledLocaleString(vat, user?.geoInfo)}
                </Typography>
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>{t('orderDetail.payment.total')}:</Typography>
                <Typography
                    variant={'body2'}
                    textAlign={'right'}
                    translate={'no'}>
                    {useStyledLocaleString(total, user?.geoInfo)}
                </Typography>
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>{t('orderDetail.payment.discount')}:</Typography>
                <Typography
                    variant={'body2'}
                    textAlign={'right'}
                    translate={'no'}>
                    -{useStyledLocaleString(discount, user?.geoInfo)}
                </Typography>
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>{t('orderDetail.payment.amountDue')}:</Typography>
                <Typography
                    variant={'body2'}
                    textAlign={'right'}
                    translate={'no'}>
                    {useStyledLocaleString(payAmount, user?.geoInfo)}
                </Typography>
            </Box>
        </Box>
    );
};

export default PaymentItem;
