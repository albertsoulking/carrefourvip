import { Box, Typography, Button } from '@mui/material';
import web from '../../routes/web';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import api from '../../routes/api';
import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

export default function TopUpCancelPage() {
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
            status: 'cancelled'
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
            sx={{
                minHeight: '100vh',
                bgcolor: 'var(--brand-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2
            }}>
            <Box
                sx={{
                    width: '100%',
                    p: 3,
                    borderRadius: '28px',
                    bgcolor: '#fffdfa',
                    border: '1px solid var(--brand-line)',
                    boxShadow: 'var(--brand-shadow)'
                }}>
            <HighlightOffRoundedIcon
                color={'error'}
                sx={{ fontSize: 80 }}
            />
            <Typography
                variant={'h4'}
                mt={2}>
                Top Up Cancellation
            </Typography>
            <Typography
                variant={'body1'}
                mt={1}>
                Your top up has been cancelled. If you have any questions,
                please contact customer service.
            </Typography>
            <Button
                variant={'outlined'}
                color={'error'}
                sx={{ mt: 4 }}
                onClick={() => navigate(web.wallet)}>
                Back to My Wallet
            </Button>
            </Box>
        </Box>
    );
}
