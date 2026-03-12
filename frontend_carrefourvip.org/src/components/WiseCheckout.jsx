import { Button } from '@mui/material';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';

export default function WiseCheckout() {
    const [disabled, setDisabled] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    const handleOnClick = async () => {
        if (!user) return;

        try {
            setDisabled(true);

            setTimeout(() => {
                setDisabled(false);
            }, 1000);
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
            sx={{ bgcolor: '#163300', color: '#9fe870' }}
            onClick={handleOnClick}
            fullWidth
            disabled={disabled}>
            Pay with Wise
        </Button>
    );
}
