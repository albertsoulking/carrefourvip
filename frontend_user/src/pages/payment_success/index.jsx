import { Box, Typography, Button } from '@mui/material';
import web from '../../routes/web';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import NotInterestedRoundedIcon from '@mui/icons-material/NotInterestedRounded';
import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import api from '../../routes/api';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { enqueueSnackbar } from 'notistack';

export default function PaymentSuccessPage() {
    const { id } = useParams();
    const navigate = useSmartNavigate();
    const hasCalled = useRef(false);
    const [errorText, setErrorText] = useState(false);
    const [errorInvalid, setErrorInvalid] = useState(false);

    useEffect(() => {
        if (hasCalled.current) return;
        hasCalled.current = true;
        fetchData();
    }, []);

    const fetchData = async () => {
        const payload = {
            id: Number(id),
            status: 'pending',
            paymentStatus: 'paid'
        };

        try {
            await api.orders.updateStatus(payload);
        } catch (error) {
            if (error.status === 400) {
                setErrorInvalid(false);
                setErrorText(true);
            }

            if (error.status === 404) {
                setErrorInvalid(true);
                setErrorText(false);
            }

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
            textAlign={'center'}
            mt={10}>
            <CheckCircleOutlineRoundedIcon
                color={'success'}
                sx={{ fontSize: 80, display: errorInvalid ? 'none' : 'inline' }}
            />
            <NotInterestedRoundedIcon
                color={'action'}
                sx={{ fontSize: 80, display: errorInvalid ? 'inline' : 'none' }}
            />
            <Typography
                variant={'h4'}
                mt={2}>
                <span style={{ display: errorText ? 'inline' : 'none' }}>
                    Operation Completed
                </span>
                <span
                    style={{
                        display: !errorText && !errorInvalid ? 'inline' : 'none'
                    }}>
                    Payment Successful
                </span>
                <span style={{ display: errorInvalid ? 'inline' : 'none' }}>
                    Invalid Payment Link
                </span>
            </Typography>
            <Typography
                variant={'body1'}
                mt={1}>
                <span style={{ display: errorText ? 'inline' : 'none' }}>
                    You have completed the payment, This checkout session has
                    expired!
                </span>
                <span
                    style={{
                        display: !errorText && !errorInvalid ? 'inline' : 'none'
                    }}>
                    Thank you for your purchase! We have received your order.
                </span>
                <span style={{ display: errorInvalid ? 'inline' : 'none' }}>
                    This payment link is invalid, this checkout session has
                    expired!
                </span>
            </Typography>
            <Button
                variant={errorInvalid ? 'outlined' : 'contained'}
                color={errorInvalid ? 'inherit' : 'primary'}
                sx={{ mt: 4 }}
                onClick={() => navigate(web.home)}>
                Back to Home
            </Button>
        </Box>
    );
}
