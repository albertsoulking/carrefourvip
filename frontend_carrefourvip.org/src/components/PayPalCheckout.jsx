import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import api from '../routes/api';
import { enqueueSnackbar } from 'notistack';

const PaypalCheckout = ({
    amount,
    orderId,
    setOpen,
    userId,
    config
}) => {
    return (
        <PayPalScriptProvider
            options={{
                'client-id': config.clientId,
                currency: config.currency,
                components: 'buttons',
                'enable-funding': 'venmo',
                'disable-funding': ''
            }}>
            <PayPalButtons
                forceReRender={[config.clientId, amount, config.currency]}
                style={{
                    shape: 'rect',
                    layout: 'vertical',
                    color: 'gold',
                    label: 'paypal'
                }}
                createOrder={async () => {
                    try {
                        const res = await api.paypal.createOrder({
                            userId,
                            amount
                        });

                        return res.data.id; // 返回订单ID给 PayPal
                    } catch (err) {
                        enqueueSnackbar('Error creating PayPal order: ' + err, {
                            variant: 'error'
                        });
                    }
                }}
                onApprove={async (data) => {
                    try {
                        const res = await api.paypal.captureOrder({
                            userId,
                            orderId: data.orderID
                        });

                        if (res.data.status === 'COMPLETED') {
                            const payload = {
                                id: orderId,
                                status: 'pending',
                                paymentStatus: 'paid',
                                transactionNumber: res.data.id,
                                paypalResponseRaw: JSON.stringify(res.data)
                            };

                            try {
                                await api.orders.updatePayOrder(payload);
                                setOpen && setOpen({ open: false, data: null });
                                enqueueSnackbar('Payment Successful!', {
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
                        } else {
                            const payload = {
                                id: orderId,
                                status: 'cancelled',
                                paymentStatus: 'cancelled',
                                transactionNumber: res.data.id,
                                paypalResponseRaw: JSON.stringify(res.data)
                            };

                            try {
                                await api.orders.updatePayOrder(payload);
                                setOpen && setOpen({ open: false, data: null });
                                enqueueSnackbar('Payment Failed!', {
                                    variant: 'error'
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
                        }
                    } catch (err) {
                        enqueueSnackbar(
                            'Error capturing PayPal payment: ' + err,
                            {
                                variant: 'error'
                            }
                        );
                    }
                }}
                onError={(err) => {
                    enqueueSnackbar('PayPal Checkout Error: ' + err, {
                        variant: 'error'
                    });
                }}
            />
        </PayPalScriptProvider>
    );
};

export default PaypalCheckout;
