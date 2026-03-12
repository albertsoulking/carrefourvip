import { CopyAllRounded } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useSmartNavigate } from '../hooks/useSmartNavigate';
import web from '../routes/web';
import { enqueueSnackbar } from 'notistack';

export default function CardCheckout({ orderId, setOpen, config }) {
    const navigate = useSmartNavigate();
    const [loading, setLoading] = useState(false);

    const handleOnPayLater = async () => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            setOpen({ open: false, data: null });
        }, 500);
    };

    const handleSubmit = async () => {
        setLoading();

        navigate(web.paySubmit(orderId));
    };

    return (
        <Box sx={{ bgcolor: '#fafafa', borderRadius: 2, p: 2 }}>
            <Box
                sx={{
                    bgcolor: '#e3e3e3',
                    p: 1,
                    borderRadius: 2
                }}>
                <Typography
                    fontSize={12}
                    sx={{ mb: 1 }}>
                    <strong>Account Name: </strong>
                    <span>{config.accountName}</span>
                    <CopyAllRounded
                        fontSize={'small'}
                        sx={{
                            ml: 1,
                            verticalAlign: 'text-bottom',
                            float: 'right'
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(config.accountName);
                            enqueueSnackbar('Copied Account Name!', {
                                variant: 'primary'
                            });
                        }}
                    />
                </Typography>
                <Typography
                    fontSize={12}
                    sx={{ mb: 1 }}>
                    <strong>Account Number: </strong>
                    <span>{config.accountNumber}</span>
                    <CopyAllRounded
                        fontSize={'small'}
                        sx={{
                            ml: 1,
                            verticalAlign: 'text-bottom',
                            float: 'right'
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(config.accountNumber);
                            enqueueSnackbar('Copied Account Number!', {
                                variant: 'primary'
                            });
                        }}
                    />
                </Typography>
                <Typography
                    fontSize={12}
                    sx={{ mb: 1 }}>
                    <strong>Bank Name: </strong>
                    <span>{config.bankName}</span>
                    <CopyAllRounded
                        fontSize={'small'}
                        sx={{
                            ml: 1,
                            verticalAlign: 'text-bottom',
                            float: 'right'
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(config.bankName);
                            enqueueSnackbar('Copied Bank Name!', {
                                variant: 'primary'
                            });
                        }}
                    />
                    <br />
                    <span>
                        (Full Name: Joint Stock Commercial Bank for Foreign
                        Trade of Vietnam)
                    </span>
                </Typography>
                <Typography
                    fontSize={12}
                    sx={{ mb: 1 }}>
                    <strong>SWIFT Code: </strong>
                    <span>{config.swiftCode}</span>
                    <CopyAllRounded
                        fontSize={'small'}
                        sx={{
                            ml: 1,
                            verticalAlign: 'text-bottom',
                            float: 'right'
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(config.swiftCode);
                            enqueueSnackbar('Copied SWIFT Code!', {
                                variant: 'primary'
                            });
                        }}
                    />
                </Typography>
                <Typography fontSize={12}>
                    <strong>Bank Address: </strong>
                    <span>{config.bankAddress}</span>
                    <CopyAllRounded
                        fontSize={'small'}
                        sx={{
                            ml: 1,
                            verticalAlign: 'text-bottom',
                            float: 'right'
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(config.bankAddress);
                            enqueueSnackbar('Copied Bank Address!', {
                                variant: 'primary'
                            });
                        }}
                    />
                </Typography>
            </Box>
            <Typography
                fontSize={14}
                mt={3}>
                {config.note}
            </Typography>
            <Box>
                <Button
                    variant={'outlined'}
                    size={'small'}
                    loading={loading}
                    sx={{ textTransform: 'capitalize' }}
                    onClick={handleOnPayLater}>
                    Pay later
                </Button>
                <Button
                    variant={'contained'}
                    size={'small'}
                    sx={{ textTransform: 'capitalize' }}
                    onClick={handleSubmit}>
                    Confirm payment
                </Button>
            </Box>
        </Box>
    );
}
