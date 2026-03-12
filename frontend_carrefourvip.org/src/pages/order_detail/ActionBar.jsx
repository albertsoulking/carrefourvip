import { Box, Button } from '@mui/material';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

const ActionBar = ({
    id,
    status,
    paymentStatus,
    loadData,
    setOpenPayment,
    data
}) => {
    const handleOnDelete = async () => {
        try {
            await api.orders.deleteOrder({ orderId: id });
            loadData();
            enqueueSnackbar('The order has been deleted!', {
                variant: 'success'
            });
        } catch (error) {
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

    const handleOnBuyAgain = async () => {
        try {
            await api.carts.buyAgain({ orderId: id });

            // loadCartData();
            enqueueSnackbar(
                'The products has been added to the shopping cart!',
                {
                    variant: 'success'
                }
            );
        } catch (error) {
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

    const handleOnChangeStatus = async () => {
        const payload = {
            id,
            status: 'cancelled',
            paymentStatus: 'cancelled'
        };
        try {
            await api.orders.updateStatus(payload);
            loadData();
        } catch (error) {
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
            display={'flex'}
            justifyContent={'flex-end'}
            gap={1}
            mt={1}>
            <Button
                variant={'outlined'}
                color={'action'}
                size={'small'}
                sx={{
                    textTransform: 'capitalize',
                    display: paymentStatus === 'pending' ? 'inline' : 'none'
                }}
                onClick={handleOnChangeStatus}>
                Cancel Order
            </Button>
            <Button
                variant={'outlined'}
                color={'action'}
                size={'small'}
                sx={{ textTransform: 'capitalize' }}
                onClick={handleOnBuyAgain}>
                Buy Again
            </Button>
            <Button
                variant={'contained'}
                color={'primary'}
                size={'small'}
                sx={{
                    textTransform: 'capitalize',
                    display: paymentStatus === 'pending' ? 'inline' : 'none'
                }}
                onClick={() => {
                    if (data.paymentLink) {
                        window.location.href = data.paymentLink;
                        return;
                    }

                    setOpenPayment({ open: true, data });
                }}>
                Continue Payment
            </Button>
            <Button
                variant={'outlined'}
                color={'action'}
                size={'small'}
                sx={{
                    textTransform: 'capitalize',
                    display:
                        status === 'delivered' ||
                        status === 'cancelled' ||
                        status === 'refunded'
                            ? 'inline'
                            : 'none'
                }}
                onClick={handleOnDelete}>
                Delete Order
            </Button>
        </Box>
    );
};

export default ActionBar;
