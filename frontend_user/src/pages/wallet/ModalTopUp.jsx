import { CloseRounded, CopyAllRounded } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    TextField,
    Typography
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import api from '../../routes/api';

const MIN_DEPOSIT = 10;

const BANK = {
    accountName: 'ZenithLuckvip LLC',
    ibanDisplay: 'BE96 9056 4399 2505',
    ibanCopy: 'BE96905643992505',
    swift: 'TRWIBEB1XXX',
    bankAddressLines: [
        'Wise',
        'Rue du Trône 100, 3rd Floor',
        'Brussels 1050',
        'Belgium'
    ]
};

export default function ModalTopUp({ open, setOpen, user, onDepositCreated }) {
    const { t } = useTranslation();
    const noticeItemsRaw = t('wallet.bankTransfer.noticeItems', {
        returnObjects: true
    });
    const ctaStepsRaw = t('wallet.bankTransfer.ctaSteps', {
        returnObjects: true
    });
    const noticeItems = Array.isArray(noticeItemsRaw) ? noticeItemsRaw : [];
    const ctaSteps = Array.isArray(ctaStepsRaw) ? ctaStepsRaw : [];
    const fileInputRef = useRef(null);
    const [amount, setAmount] = useState('');
    const [receiptFile, setReceiptFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(null);

    const resetForm = () => {
        setAmount('');
        setReceiptFile(null);
        setSubmitted(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleOnClose = () => {
        resetForm();
        setOpen(false);
    };

    const copyText = (text, messageKey) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar(t(messageKey), { variant: 'success' });
    };

    const handleReceiptChange = (e) => {
        const file = e.target.files?.[0];
        setReceiptFile(file ?? null);
    };

    const handleSubmit = async () => {
        if (!user?.id) {
            enqueueSnackbar(t('wallet.bankTransfer.loginRequired'), {
                variant: 'warning'
            });
            return;
        }

        const amountNum = parseFloat(amount, 10);
        if (!amount || Number.isNaN(amountNum) || amountNum < MIN_DEPOSIT) {
            enqueueSnackbar(t('wallet.bankTransfer.invalidAmount'), {
                variant: 'error'
            });
            return;
        }

        if (!receiptFile) {
            enqueueSnackbar(t('wallet.bankTransfer.receiptRequired'), {
                variant: 'error'
            });
            return;
        }

        setSubmitting(true);
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

            const base = (import.meta.env.VITE_API_BASE_URL || '').replace(
                /\/$/,
                ''
            );
            const proofImageUrl = `${base}/uploads/images/${proofImage}`;

            const reference =
                [user?.email, user?.id]
                    .filter((x) => x != null && x !== '')
                    .join(' / ') || undefined;

            const res = await api.transaction.createDeposit({
                amount: amountNum,
                reference,
                proofImage,
                proofImageUrl
            });

            const created = res.data;
            setSubmitted({
                transactionNumber: created?.transactionNumber,
                amount: amountNum,
                status: created?.status ?? 'pending',
                id: created?.id
            });
            onDepositCreated?.(created);
            enqueueSnackbar(t('wallet.bankTransfer.submitSuccess'), {
                variant: 'success'
            });
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
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleOnClose}
            maxWidth={'sm'}
            fullWidth
            scroll={'paper'}>
            <DialogTitle sx={{ pr: 5 }}>
                {t('wallet.topUp.title')}
            </DialogTitle>
            <IconButton
                sx={{ position: 'absolute', right: 8, top: 8 }}
                onClick={handleOnClose}
                aria-label='close'>
                <CloseRounded />
            </IconButton>
            <DialogContent
                dividers
                sx={{ maxHeight: 'min(85vh, 720px)' }}>
                {submitted ? (
                    <Box>
                        <Alert
                            severity={'info'}
                            sx={{ mb: 2 }}>
                            {t('wallet.bankTransfer.pendingNotice')}
                        </Alert>
                        <Typography
                            variant={'body2'}
                            sx={{ mb: 1 }}>
                            <strong>{t('wallet.bankTransfer.referenceNo')}: </strong>
                            <span translate={'no'}>{submitted.transactionNumber}</span>
                            {submitted.transactionNumber && (
                                <CopyAllRounded
                                    fontSize={'small'}
                                    sx={{
                                        ml: 0.5,
                                        verticalAlign: 'middle',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() =>
                                        copyText(
                                            submitted.transactionNumber,
                                            'wallet.bankTransfer.copiedRef'
                                        )
                                    }
                                />
                            )}
                        </Typography>
                        <Typography
                            variant={'body2'}
                            sx={{ mb: 1 }}>
                            <strong>{t('wallet.bankTransfer.submittedAmount')}: </strong>
                            <span translate={'no'}>{submitted.amount}</span>
                        </Typography>
                        <Typography
                            variant={'body2'}
                            sx={{ mb: 2 }}>
                            <strong>{t('wallet.table.status')}: </strong>
                            {t('wallet.bankTransfer.statusPending')}
                        </Typography>
                        <Typography
                            variant={'body2'}
                            color={'text.secondary'}
                            sx={{ mb: 2 }}>
                            {t('wallet.bankTransfer.estimatedProcessing')}
                        </Typography>
                        <Button
                            variant={'contained'}
                            fullWidth
                            onClick={handleOnClose}>
                            {t('wallet.bankTransfer.doneClose')}
                        </Button>
                    </Box>
                ) : (
                    <>
                        <TextField
                            value={amount}
                            type={'number'}
                            label={t('wallet.bankTransfer.depositAmount')}
                            helperText={t('wallet.bankTransfer.minimumAmount')}
                            size={'small'}
                            fullWidth
                            sx={{ mb: 2 }}
                            onChange={(e) => setAmount(e.target.value)}
                            inputProps={{ min: MIN_DEPOSIT, step: '0.01' }}
                        />

                        <Typography
                            variant={'subtitle2'}
                            color={'text.secondary'}
                            sx={{ mb: 1 }}>
                            {t('wallet.bankTransfer.referenceHint', {
                                reference:
                                    [user?.email, user?.id]
                                        .filter((x) => x != null && x !== '')
                                        .join(' / ') || '—'
                            })}
                        </Typography>

                        <Box
                            sx={{
                                bgcolor: 'rgba(0,0,0,0.04)',
                                borderRadius: 'var(--brand-radius-md)',
                                p: 2,
                                mb: 2
                            }}>
                            <Typography
                                variant={'subtitle1'}
                                fontWeight={'bold'}
                                gutterBottom>
                                {t('wallet.bankTransfer.bankDetailsTitle')}
                            </Typography>
                            <Typography
                                fontSize={13}
                                sx={{ mb: 1 }}>
                                <strong>
                                    {t('wallet.bankTransfer.accountName')}:{' '}
                                </strong>
                                {BANK.accountName}
                            </Typography>

                            <Typography
                                fontSize={13}
                                sx={{ mb: 1, wordBreak: 'break-all' }}>
                                <strong>{t('wallet.bankTransfer.iban')}: </strong>
                                {BANK.ibanDisplay}
                                <CopyAllRounded
                                    fontSize={'small'}
                                    sx={{
                                        ml: 0.5,
                                        verticalAlign: 'middle',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() =>
                                        copyText(
                                            BANK.ibanCopy,
                                            'wallet.bankTransfer.copiedIban'
                                        )
                                    }
                                />
                            </Typography>

                            <Typography
                                fontSize={13}
                                sx={{ mb: 1 }}>
                                <strong>{t('wallet.bankTransfer.swift')}: </strong>
                                {BANK.swift}
                                <CopyAllRounded
                                    fontSize={'small'}
                                    sx={{
                                        ml: 0.5,
                                        verticalAlign: 'middle',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() =>
                                        copyText(
                                            BANK.swift,
                                            'wallet.bankTransfer.copiedSwift'
                                        )
                                    }
                                />
                            </Typography>

                            <Typography fontSize={13}>
                                <strong>
                                    {t('wallet.bankTransfer.bankAddress')}:{' '}
                                </strong>
                                {BANK.bankAddressLines.map((line, i) => (
                                    <span key={line}>
                                        {i > 0 && <br />}
                                        {line}
                                    </span>
                                ))}
                            </Typography>
                        </Box>

                        <Typography
                            variant={'subtitle2'}
                            gutterBottom>
                            {t('wallet.bankTransfer.importantNoticeTitle')}
                        </Typography>
                        <List
                            dense
                            disablePadding
                            sx={{ mb: 2, pl: 0 }}>
                            {noticeItems.map((item, idx) => (
                                <ListItem
                                    key={idx}
                                    disableGutters
                                    sx={{ py: 0.25 }}>
                                    <ListItemText primary={item} />
                                </ListItem>
                            ))}
                        </List>

                        <Divider sx={{ my: 2 }} />

                        <Typography
                            variant={'subtitle2'}
                            gutterBottom>
                            {t('wallet.bankTransfer.ctaTitle')}
                        </Typography>
                        <Box
                            component={'ol'}
                            sx={{
                                pl: 2.5,
                                m: 0,
                                mb: 2,
                                '& li': { mb: 0.75, fontSize: 14 }
                            }}>
                            {ctaSteps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                            ))}
                        </Box>
                        <Typography
                            variant={'body2'}
                            color={'text.secondary'}
                            sx={{ mb: 2 }}>
                            {t('wallet.bankTransfer.balanceNote')}
                        </Typography>

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
                            gap={1}
                            mb={2}>
                            <Button
                                variant={'outlined'}
                                size={'small'}
                                sx={{
                                    alignSelf: 'flex-start',
                                    textTransform: 'none'
                                }}
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

                        <LoadingButton
                            variant={'contained'}
                            fullWidth
                            loading={submitting}
                            onClick={handleSubmit}>
                            {t('wallet.bankTransfer.submitReview')}
                        </LoadingButton>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
