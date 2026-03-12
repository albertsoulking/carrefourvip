import { useMemo } from 'react';
import { Button } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import api from '../routes/api';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';

const StripeCheckout = ({ orderId, price, name, config }) => {
    const [disabled, setDisabled] = useState(false);
    const stripePromise = useMemo(
        () => loadStripe(config.apiKey),
        [config.apiKey]
    );

    const handleClick = async () => {
        try {
            setDisabled(true);

            const payload = {
                orderId,
                price,
                name,
                type: 'order_payment'
            };

            const res = await api.stripe.checkoutOrder(payload);

            const stripe = await stripePromise;
            setDisabled(false);
            stripe.redirectToCheckout({ sessionId: res.data.id });
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
            loading={disabled}
            variant={'contained'}
            fullWidth
            onClick={handleClick}
            disabled={disabled}>
            Pay with Stripe
        </Button>
    );
};

export default StripeCheckout;
