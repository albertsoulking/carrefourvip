import { CloseRounded, CopyAllRounded } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useEffect, useRef, useState } from 'react';
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

const DEPOSIT_GATEWAY_CODES = new Set(['card', 'wise']);

export default function ModalTopUp({ open, setOpen, user, onDepositCreated }) {
    const { t } = useTranslation();
    const ctaStepsRaw = t('wallet.bankTransfer.ctaSteps', {
        returnObjects: true
    });
    const ctaSteps = Array.isArray(ctaStepsRaw) ? ctaStepsRaw : [];
    const fileInputRef = useRef(null);
    const [amount, setAmount] = useState('');
    const [receiptFile, setReceiptFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(null);
    const [gatewaysLoading, setGatewaysLoading] = useState(false);
    const [depositGateways, setDepositGateways] = useState([]);
    const [selectedGatewayCode, setSelectedGatewayCode] = useState('');

    const selectedGateway = depositGateways.find(
        (gateway) => gateway.provider?.code === selectedGatewayCode
    );
    const gatewayConfig = selectedGateway?.config || {};
    const bankDetails = {
        accountName: gatewayConfig.accountName || BANK.accountName,
        ibanDisplay:
            gatewayConfig.iban || gatewayConfig.accountNumber || BANK.ibanDisplay,
        ibanCopy:
            gatewayConfig.iban || gatewayConfig.accountNumber || BANK.ibanCopy,
        swift: gatewayConfig.swiftCode || BANK.swift,
        bankAddressLines: (gatewayConfig.bankAddress || '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .length
            ? (gatewayConfig.bankAddress || '')
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
            : BANK.bankAddressLines
    };

    useEffect(() => {
        if (!open) return;
        if (!user?.id) return;

        const loadDepositGateways = async () => {
            setGatewaysLoading(true);
            try {
                const res = await api.gateway.getAll();
                const available = (res.data || []).filter((gateway) => {
                    const code = gateway.provider?.code;
                    if (!DEPOSIT_GATEWAY_CODES.has(code)) return false;
                    if (gateway.status !== 'active') return false;

                    const blackList = Array.isArray(gateway.blackList)
                        ? gateway.blackList
                        : [];
                    return !blackList.includes(String(user.id));
                });

                setDepositGateways(available);
                setSelectedGatewayCode(available[0]?.provider?.code || '');
            } catch (error) {
                setDepositGateways([]);
                setSelectedGatewayCode('');
                enqueueSnackbar(
                    Array.isArray(error.response?.data?.message)
                        ? error.response.data.message[0]
                        : error.response?.data?.message || error.message,
                    { variant: 'error' }
                );
            } finally {
                setGatewaysLoading(false);
            }
        };

        loadDepositGateways();
    }, [open, user?.id]);

    const resetForm = () => {
        setAmount('');
        setReceiptFile(null);
        setSubmitted(null);
        setSelectedGatewayCode('');
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
        if (!selectedGatewayCode) {
            enqueueSnackbar(t('payment.gatewayUnavailable'), {
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
                payMethod: selectedGatewayCode,
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
                        {gatewaysLoading ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mb: 2
                                }}>
                                <CircularProgress size={22} />
                            </Box>
                        ) : (
                            <>
                                {depositGateways.length > 0 ? (
                                    <FormControl
                                        fullWidth
                                        size={'small'}
                                        sx={{ mb: 2 }}>
                                        <InputLabel id={'deposit-gateway-label'}>
                                            Payment Method
                                        </InputLabel>
                                        <Select
                                            labelId={'deposit-gateway-label'}
                                            value={selectedGatewayCode}
                                            label={'Payment Method'}
                                            onChange={(e) =>
                                                setSelectedGatewayCode(
                                                    e.target.value
                                                )
                                            }>
                                            {depositGateways.map((gateway) => (
                                                <MenuItem
                                                    key={gateway.id}
                                                    value={
                                                        gateway.provider?.code
                                                    }>
                                                    {gateway.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <Alert
                                        severity={'warning'}
                                        sx={{ mb: 2 }}>
                                        {t('payment.gatewayUnavailable')}
                                    </Alert>
                                )}
                            </>
                        )}

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
                                <span translate='no'>{bankDetails.accountName}</span>
                            </Typography>

                            <Typography
                                fontSize={13}
                                sx={{ mb: 1, wordBreak: 'break-all' }}>
                                <strong>{t('wallet.bankTransfer.iban')}: </strong>
                                <span translate='no'>{bankDetails.ibanDisplay}</span>
                                <CopyAllRounded
                                    fontSize={'small'}
                                    sx={{
                                        ml: 0.5,
                                        verticalAlign: 'middle',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() =>
                                        copyText(
                                            bankDetails.ibanCopy,
                                            'wallet.bankTransfer.copiedIban'
                                        )
                                    }
                                />
                            </Typography>

                            <Typography
                                fontSize={13}
                                sx={{ mb: 1 }}>
                                <strong>{t('wallet.bankTransfer.swift')}: </strong>
                                <span translate='no'>{bankDetails.swift}</span>
                                <CopyAllRounded
                                    fontSize={'small'}
                                    sx={{
                                        ml: 0.5,
                                        verticalAlign: 'middle',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() =>
                                        copyText(
                                            bankDetails.swift,
                                            'wallet.bankTransfer.copiedSwift'
                                        )
                                    }
                                />
                            </Typography>

                            <Typography fontSize={13}>
                                <strong>
                                    {t('wallet.bankTransfer.bankAddress')}:{' '}
                                </strong>
                                {bankDetails.bankAddressLines.map((line, i) => (
                                    <span key={line} translate='no'>
                                        {i > 0 && <br />}
                                        {line}
                                    </span>
                                ))}
                            </Typography>
                        </Box>

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
                                sx={{
                                    alignSelf: 'flex-start',
                                    textTransform: 'none'
                                }}
                                fullWidth
                                size={'small'}
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
                            disabled={
                                gatewaysLoading || depositGateways.length === 0
                            }
                            loading={submitting}
                            onClick={handleSubmit}
                            size={'small'}>
                            {t('wallet.bankTransfer.submitReview')}
                        </LoadingButton>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
