import { Box, Typography, Button } from '@mui/material';
import web from '../../routes/web';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import NotInterestedRoundedIcon from '@mui/icons-material/NotInterestedRounded';
import api from '../../routes/api';
import { useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { enqueueSnackbar } from 'notistack';

export default function PaymentCancelPage() {
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
            status: 'cancelled',
            paymentStatus: 'cancelled'
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
            <HighlightOffRoundedIcon
                color={'error'}
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
                    Payment Cancellation
                </span>
                <span style={{ display: errorInvalid ? 'inline' : 'none' }}>
                    Invalid Payment Link
                </span>
            </Typography>
            <Typography
                variant={'body1'}
                mt={1}>
                <span style={{ display: errorText ? 'inline' : 'none' }}>
                    You have cancelled the payment, This checkout session has
                    expired!
                </span>
                <span
                    style={{
                        display: !errorText && !errorInvalid ? 'inline' : 'none'
                    }}>
                    Your payment has been cancelled. If you have any questions,
                    please contact customer service.
                </span>
                <span style={{ display: errorInvalid ? 'inline' : 'none' }}>
                    This payment link is invalid, this checkout session has
                    expired!
                </span>
            </Typography>
            <Button
                variant={errorInvalid ? 'outlined' : 'contained'}
                color={errorInvalid ? 'inherit' : 'error'}
                sx={{ mt: 4 }}
                onClick={() => navigate(web.home)}>
                Back to Home
            </Button>
        </Box>
    );
}
