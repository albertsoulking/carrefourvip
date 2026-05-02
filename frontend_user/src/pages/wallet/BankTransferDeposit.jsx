import { CopyAllRounded } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Divider,
    FormControl,
    FormControlLabel,
    FormLabel,
    List,
    ListItem,
    ListItemText,
    Paper,
    Radio,
    RadioGroup,
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

export default function BankTransferDeposit({ user, onOpenOnlineTopUp }) {
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
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [receiptFile, setReceiptFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

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

        if (paymentMethod === 'online') {
            onOpenOnlineTopUp?.();
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
            const receiptName = imgRes.data?.name;
            const base = import.meta.env.VITE_API_BASE_URL || '';
            const receiptUrl = receiptName
                ? `${base}/uploads/images/${receiptName}`
                : '';

            const subject = t('wallet.bankTransfer.ticketSubject', {
                amount: amountNum
            });
            const message = t('wallet.bankTransfer.ticketBody', {
                amount: amountNum,
                userId: user.id,
                email: user.email ?? t('wallet.bankTransfer.notApplicable'),
                receiptUrl
            });

            await api.tickets.createOne({ subject, message });

            enqueueSnackbar(t('wallet.bankTransfer.submitSuccess'), {
                variant: 'success'
            });
            setAmount('');
            setReceiptFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
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
        <Paper
            sx={{
                p: 3,
                mb: 2,
                borderRadius: 'var(--brand-radius-xl)',
                bgcolor: 'var(--brand-paper)',
                border: '1px solid var(--brand-line)',
                boxShadow: 'var(--brand-shadow)'
            }}
            elevation={0}>
            <Typography
                variant={'h6'}
                fontFamily={'var(--font-display)'}
                gutterBottom>
                {t('wallet.bankTransfer.sectionTitle')}
            </Typography>

            <TextField
                value={amount}
                type={'number'}
                label={t('wallet.bankTransfer.depositAmount')}
                helperText={
                    paymentMethod === 'online'
                        ? t('wallet.bankTransfer.amountOnlineHint')
                        : t('wallet.bankTransfer.minimumAmount')
                }
                size={'small'}
                fullWidth
                sx={{ mb: 2 }}
                onChange={(e) => setAmount(e.target.value)}
                inputProps={{ min: MIN_DEPOSIT, step: '0.01' }}
            />

            <FormControl
                component={'fieldset'}
                sx={{ mb: 2 }}>
                <FormLabel
                    component={'legend'}
                    sx={{ fontSize: 14, mb: 1 }}>
                    {t('wallet.bankTransfer.paymentMethod')}
                </FormLabel>
                <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}>
                    <FormControlLabel
                        value={'bank_transfer'}
                        control={<Radio size={'small'} />}
                        label={t('wallet.bankTransfer.methodBank')}
                    />
                    <FormControlLabel
                        value={'online'}
                        control={<Radio size={'small'} />}
                        label={t('wallet.bankTransfer.methodOnline')}
                    />
                </RadioGroup>
            </FormControl>

            {paymentMethod === 'online' && (
                <Alert
                    severity={'info'}
                    sx={{ mb: 2 }}>
                    {t('wallet.bankTransfer.onlineHint')}
                </Alert>
            )}

            {paymentMethod === 'bank_transfer' && (
                <>
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
                            <strong>{t('wallet.bankTransfer.accountName')}: </strong>
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
                            sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
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
                </>
            )}

            <LoadingButton
                variant={'contained'}
                fullWidth
                loading={submitting}
                onClick={handleSubmit}>
                {paymentMethod === 'online'
                    ? t('wallet.bankTransfer.openOnlineTopUp')
                    : t('wallet.bankTransfer.submitReview')}
            </LoadingButton>
        </Paper>
    );
}
