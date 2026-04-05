import { Button } from '@mui/material';
import { useState } from 'react';
import api from '../routes/api';
import { enqueueSnackbar } from 'notistack';

const LemonSqueezyCheckout = () => {
    const [disabled, setDisabled] = useState(false);

    const handleOnClick = async () => {
        try {
            setDisabled(true);

            const payload = {

            };
            
            const res = await api.lemon.checkoutOrder(payload);
            setTimeout(() => {
                setDisabled(false);
                location.href = res.data.url;
            }, 500);
        } catch (error) {
            setDisabled(false);
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
        <Button
            variant={'contained'}
            sx={{
                bgcolor: '#5423e7',
                color: '#ffc233'
            }}
            fullWidth
            onClick={handleOnClick}
            disabled={disabled}>
            Pay with Lemon Squeezy
        </Button>
    );
};

export default LemonSqueezyCheckout;
