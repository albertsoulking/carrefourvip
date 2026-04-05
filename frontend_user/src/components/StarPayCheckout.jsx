import {
    Button
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../routes/api';
import { enqueueSnackbar } from 'notistack';

export default function StarPayCheckout({ open, data }) {
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        // handleClick();
    }, [open]);

    const handleClick = async () => {
        if (!data || !user) return;
        setLoading(true);

        const payload = {
            orderId: data?.id.toString(),
            amount: data?.payAmount
            // mode: user?.mode,
        };

        try {
            const res = await api.starPay.create(payload);

            if (res.data.code === 400) {
                enqueueSnackbar(res.data.message, {
                    variant: 'warning'
                });
                setLoading(false);
                return;
            }

            const params = JSON.parse(res.data.params);

            if (params.status === 0) {
                window.location.href = params.payurl;
            } else {
                enqueueSnackbar(params.reason, {
                    variant: 'error'
                });
            }
            setLoading(false);
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
        <Button
            variant={'contained'}
            onClick={handleClick}
            fullWidth
            disabled={loading}>
            Star Pay
        </Button>
    );
}
