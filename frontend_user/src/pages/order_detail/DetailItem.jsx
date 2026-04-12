import { Box, Button, Typography } from '@mui/material';
import PayMethod from './PayMethod';
import DeliveryMethod from './DeliveryMethod';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const DetailItem = ({
    id,
    createdAt,
    paymentLink,
    payMethod,
    deliveryMethod
}) => {
    const { t } = useTranslation();
    return (
        <Box sx={{ mb: 2 }}>
            <Typography
                variant={'body1'}
                fontWeight={'bold'}>
                {t('orderDetail.detail.title')}
            </Typography>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>{t('payment.orderId')}:</Typography>
                <Typography
                    variant={'body2'}
                    textAlign={'right'}
                    translate={'no'}>
                    # {id}
                </Typography>
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>{t('orderDetail.detail.orderTime')}:</Typography>
                <Typography
                    variant={'body2'}
                    textAlign={'right'}
                    translate={'no'}>
                    {new Date(createdAt).toLocaleString()}
                </Typography>
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>{t('orderDetail.detail.paymentMethod')}:</Typography>
                <PayMethod status={payMethod} />
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>{t('orderDetail.detail.deliveryMethod')}:</Typography>
                <DeliveryMethod status={deliveryMethod} />
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>{t('orderDetail.detail.shareLink')}:</Typography>
                <Button
                    size={'small'}
                    sx={{
                        fontSize: 12,
                        p: 0
                    }}
                    disabled={!paymentLink}
                    onClick={() => {
                        navigator.clipboard.writeText(paymentLink);
                        enqueueSnackbar(t('orderDetail.detail.paymentLinkCopied'), {
                            variant: 'success'
                        });
                    }}>
                    {t('orderDetail.detail.clickToCopy')}
                </Button>
            </Box>
        </Box>
    );
};

export default DetailItem;
