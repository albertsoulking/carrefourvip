import { Box, Typography, Button } from '@mui/material';
import web from '../../routes/web';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import api from '../../routes/api';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { enqueueSnackbar } from 'notistack';

export default function TopUpSuccessPage() {
    const { id } = useParams();
    const navigate = useSmartNavigate();
    const hasCalled = useRef(false);

    useEffect(() => {
        if (hasCalled.current) return;
        hasCalled.current = true;
        fetchData();
    }, []);

    const fetchData = async () => {
        const payload = {
            id: Number(id),
            status: 'completed'
        };

        try {
            await api.transaction.updateOne(payload);
        } catch (error) {
            enqueueSnackbar(
                Array.isArray(error.response?.data?.message)
                    ? error.response.data.message[0]
                    : error.response?.data?.message,
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
                sx={{ fontSize: 80 }}
            />
            <Typography
                variant={'h4'}
                mt={2}>
                Top Up Successful
            </Typography>
            <Typography
                variant={'body1'}
                mt={1}>
                Thank you for your top up! You can continue shopping now.
            </Typography>
            <Button
                variant={'outlined'}
                color={'primary'}
                sx={{ mt: 4 }}
                onClick={() => navigate(web.wallet)}>
                Back to My Wallt
            </Button>
        </Box>
    );
}
