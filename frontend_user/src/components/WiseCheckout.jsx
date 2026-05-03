import { CopyAllRounded } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { useSmartNavigate } from '../hooks/useSmartNavigate';
import web from '../routes/web';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import api from '../routes/api';

export default function WiseCheckout({ orderId, setOpen, config }) {
    const { t } = useTranslation();
    const navigate = useSmartNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [receiptFile, setReceiptFile] = useState(null);

    const cfg = config || {};

    const handleReceiptChange = (e) => {
        const file = e.target.files?.[0];
        setReceiptFile(file ?? null);
    };

    const handleOnPayLater = async () => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            setOpen({ open: false, data: null });
        }, 500);
    };

    const handleSubmit = async () => {
        if (!orderId) return;

        if (!receiptFile) {
            enqueueSnackbar(t('wallet.bankTransfer.receiptRequired'), {
                variant: 'error'
            });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', receiptFile, receiptFile.name);
            const imgRes = await api.utilities.upload(formData);
            const proofImage = imgRes.data?.name;
            if (!proofImage) {
                enqueueSnackbar(t('wallet.bankTransfer.uploadFailed'), {
                    variant: 'error'
                });
                return;
            }

            await api.orders.updatePaymentProof({
                orderId,
                paymentProofImage: proofImage
            });

            navigate(web.paySubmit(orderId));
        } catch (error) {
            enqueueSnackbar(
                Array.isArray(error.response?.data?.message)
                    ? error.response.data.message[0]
                    : error.response?.data?.message ||
                          error.message ||
                          t('wallet.bankTransfer.submitError'),
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
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
                    <span>{cfg.accountName}</span>
                    <CopyAllRounded
                        fontSize={'small'}
                        sx={{
                            ml: 1,
                            verticalAlign: 'text-bottom',
                            float: 'right'
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(cfg.accountName || '');
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
                    <span>{cfg.accountNumber}</span>
                    <CopyAllRounded
                        fontSize={'small'}
                        sx={{
                            ml: 1,
                            verticalAlign: 'text-bottom',
                            float: 'right'
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(cfg.accountNumber || '');
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
                    <span>{cfg.bankName}</span>
                    <CopyAllRounded
                        fontSize={'small'}
                        sx={{
                            ml: 1,
                            verticalAlign: 'text-bottom',
                            float: 'right'
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(cfg.bankName || '');
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
                    <span>{cfg.swiftCode}</span>
                    <CopyAllRounded
                        fontSize={'small'}
                        sx={{
                            ml: 1,
                            verticalAlign: 'text-bottom',
                            float: 'right'
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(cfg.swiftCode || '');
                            enqueueSnackbar(t('payment.card.copiedSwiftCode'), {
                                variant: 'primary'
                            });
                        }}
                    />
                </Typography>
                <Typography fontSize={12}>
                    <strong>{t('payment.card.bankAddress')}: </strong>
                    <span>{cfg.bankAddress}</span>
                    <CopyAllRounded
                        fontSize={'small'}
                        sx={{
                            ml: 1,
                            verticalAlign: 'text-bottom',
                            float: 'right'
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(cfg.bankAddress || '');
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
                {cfg.note}
            </Typography>

            <Box sx={{ mt: 2, mb: 2 }}>
                <input
                    ref={fileInputRef}
                    type={'file'}
                    accept={'image/jpeg,image/png,image/jpg'}
                    hidden
                    onChange={handleReceiptChange}
                />
                <Box
                    display={'flex'}
                    flexDirection={'column'}
                    gap={1}>
                    <Button
                        variant={'outlined'}
                        size={'small'}
                        sx={{
                            alignSelf: 'flex-start',
                            textTransform: 'none'
                        }}
                        fullwidth
                        onClick={() => fileInputRef.current?.click()}>
                        {t('wallet.bankTransfer.uploadReceipt')}
                    </Button>
                    {receiptFile && (
                        <Typography
                            variant={'caption'}
                            color={'text.secondary'}>
                            {receiptFile.name}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Future: Wise hosted payment link from API
            <Button
                variant={'contained'}
                sx={{ bgcolor: '#163300', color: '#9fe870', mb: 2 }}
                fullWidth
                disabled
                onClick={() => {}}
            >
                Pay with Wise
            </Button>
            */}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant={'outlined'}
                    size={'small'}
                    disabled={loading}
                    sx={{ textTransform: 'capitalize', mr: 2 }}
                    onClick={handleOnPayLater}>
                    {t('payment.payLater')}
                </Button>
                <Button
                    variant={'contained'}
                    size={'small'}
                    sx={{ textTransform: 'capitalize' }}
                    disabled={loading}
                    onClick={handleSubmit}>
                    {t('payment.confirmPayment')}
                </Button>
            </Box>
        </Box>
    );
}
