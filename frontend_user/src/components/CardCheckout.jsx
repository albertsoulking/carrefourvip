import { CopyAllRounded } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useSmartNavigate } from '../hooks/useSmartNavigate';
import web from '../routes/web';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export default function CardCheckout({ orderId, setOpen, config }) {
    const { t } = useTranslation();
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
                    <strong>{t('payment.card.accountName')}: </strong>
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
                            enqueueSnackbar(t('payment.card.copiedAccountName'), {
                                variant: 'primary'
                            });
                        }}
                    />
                </Typography>
                <Typography
                    fontSize={12}
                    sx={{ mb: 1 }}>
                    <strong>{t('payment.card.accountNumber')}: </strong>
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
                            enqueueSnackbar(
                                t('payment.card.copiedAccountNumber'),
                                {
                                    variant: 'primary'
                                }
                            );
                        }}
                    />
                </Typography>
                <Typography
                    fontSize={12}
                    sx={{ mb: 1 }}>
                    <strong>{t('payment.card.bankName')}: </strong>
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
                            enqueueSnackbar(t('payment.card.copiedBankName'), {
                                variant: 'primary'
                            });
                        }}
                    />
                </Typography>
                <Typography
                    fontSize={12}
                    sx={{ mb: 1 }}>
                    <br />
                    <span>{t('payment.card.bankNameFull')}</span>
                </Typography>
                <Typography
                    fontSize={12}
                    sx={{ mb: 1 }}>
                    <strong>{t('payment.card.swiftCode')}: </strong>
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
                            enqueueSnackbar(t('payment.card.copiedSwiftCode'), {
                                variant: 'primary'
                            });
                        }}
                    />
                </Typography>
                <Typography fontSize={12}>
                    <strong>{t('payment.card.bankAddress')}: </strong>
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
                            enqueueSnackbar(
                                t('payment.card.copiedBankAddress'),
                                {
                                    variant: 'primary'
                                }
                            );
                        }}
                    />
                </Typography>
            </Box>
            <Typography
                fontSize={12}
                mt={3}>
                {config.note}
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant={'outlined'}
                    size={'small'}
                    loading={loading}
                    sx={{ textTransform: 'capitalize', mr: 2 }}
                    onClick={handleOnPayLater}>
                    {t('payment.payLater')}
                </Button>
                <Button
                    variant={'contained'}
                    size={'small'}
                    sx={{ textTransform: 'capitalize' }}
                    onClick={handleSubmit}>
                    {t('payment.confirmPayment')}
                </Button>
            </Box>
        </Box>
    );
}
