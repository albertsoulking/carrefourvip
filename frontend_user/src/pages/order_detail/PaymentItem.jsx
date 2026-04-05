import { Box, Typography } from '@mui/material';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';

const PaymentItem = ({
    subtotal,
    deliveryFee,
    total,
    payAmount,
    discount,
    vat
}) => {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <Box sx={{ mb: 2 }}>
            <Typography
                variant={'body1'}
                fontWeight={'bold'}>
                Payment Information
            </Typography>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>Sub Total:</Typography>
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
                <Typography variant={'body2'}>Delivery Fee:</Typography>
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
                    Vat(
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
                <Typography variant={'body2'}>Total:</Typography>
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
                <Typography variant={'body2'}>Discount:</Typography>
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
                <Typography variant={'body2'}>Amount Due:</Typography>
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
