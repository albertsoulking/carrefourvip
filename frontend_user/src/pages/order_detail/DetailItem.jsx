import { Box, Button, Typography } from '@mui/material';
import PayMethod from './PayMethod';
import DeliveryMethod from './DeliveryMethod';
import { enqueueSnackbar } from 'notistack';

const DetailItem = ({
    id,
    createdAt,
    paymentLink,
    payMethod,
    deliveryMethod
}) => {
    return (
        <Box sx={{ mb: 2 }}>
            <Typography
                variant={'body1'}
                fontWeight={'bold'}>
                Order Detail
            </Typography>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>Order ID:</Typography>
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
                <Typography variant={'body2'}>Order Time:</Typography>
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
                <Typography variant={'body2'}>Payment Method:</Typography>
                <PayMethod status={payMethod} />
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>Delivery Method:</Typography>
                <DeliveryMethod status={deliveryMethod} />
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>Share Link:</Typography>
                <Button
                    size={'small'}
                    sx={{
                        fontSize: 12,
                        p: 0
                    }}
                    disabled={!paymentLink}
                    onClick={() => {
                        navigator.clipboard.writeText(paymentLink);
                        enqueueSnackbar('Payment link copied!', {
                            variant: 'success'
                        });
                    }}>
                    Click to Copy
                </Button>
            </Box>
        </Box>
    );
};

export default DetailItem;
