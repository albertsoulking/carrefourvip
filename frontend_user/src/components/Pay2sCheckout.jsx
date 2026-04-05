import { Button } from '@mui/material';
import { useState } from 'react';
import api from '../routes/api';
import { enqueueSnackbar } from 'notistack';

export default function Pay2sCheckout({ orderId }) {
    const [disabled, setDisabled] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    const handleOnClick = async () => {
        if (!user) return;

        try {
            setDisabled(true);

            const payload = {
                orderId,
                mode: user?.mode
            };

            const res = await api.pay2s.create(payload);
            setDisabled(false);
            if (res.data.resultCode === 0) {
                window.location.href = res.data.payUrl;
            }
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
            sx={{ bgcolor: '#2b7c51' }}
            onClick={handleOnClick}
            fullWidth
            disabled={disabled}>
            Pay with Pay2s
        </Button>
    );
}
