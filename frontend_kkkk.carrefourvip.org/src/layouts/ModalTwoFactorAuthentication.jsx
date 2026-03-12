import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    TextField,
    Typography
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import api from '../routes/api';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';

const ModalTwoFactorAuthentication = ({
    open,
    data,
    setOpen,
    setOpenAccountSetting
}) => {
    const { t } = useTranslation();
    const [token, setToken] = useState(['', '', '', '', '', '']);
    const [qrCode, setQrCode] = useState({
        qrCodeUrl: '',
        secret: ''
    });
    const inputsRef = useRef([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const res = await api.twoFactor.generate2FA();
        setQrCode(res.data);
    };

    const handle2FAChange = (e, index) => {
        const val = e.target.value.replace(/\D/g, '');
        if (!val) return;

        const newToken = [...token];
        newToken[index] = val[0];
        setToken(newToken);

        // 自动聚焦下一个输入框
        if (index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handle2FAKeyDown = (e, index) => {
        const key = e.key;

        if (key === 'Backspace') {
            e.preventDefault();
            const newToken = [...token];
            newToken[index] = '';
            setToken(newToken);

            if (index > 0) {
                inputsRef.current[index - 1]?.focus();
            }
        } else if (key === 'ArrowLeft' && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (key === 'ArrowRight' && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleOnClose = () => {
        setOpen({ open: false, data: null });
        setOpenAccountSetting({
            open: true,
            data: { ...data, twoFactorEnabled: 0 }
        });
        setToken(['', '', '', '', '', '']);
    };

    const handleOnCopy = () => {
        window.navigator.clipboard.writeText(qrCode.secret);
        enqueueSnackbar('已复制密钥!', {
            variant: 'primary'
        });
    };

    const handleOnSubmit = async () => {
        try {
            if (token.some((t) => t === '')) {
                enqueueSnackbar('请输入完整6位验证码!', {
                    variant: 'error'
                });
                return;
            }

            const payload = {
                token: token.join('')
            };

            const res = await api.twoFactor.verify2FA(payload);
            if (res.data) {
                enqueueSnackbar('两步验证已设置!', {
                    variant: 'success'
                });
                setOpen({ open: false, data: null });
                setOpenAccountSetting({
                    open: true,
                    data: { ...data, twoFactorEnabled: 1 }
                });
                setToken(['', '', '', '', '', '']);
                localStorage.setItem(
                    'user',
                    JSON.stringify({ ...data, twoFactorEnabled: 1 })
                );
            } else {
                enqueueSnackbar('两步验证错误!', {
                    variant: 'error'
                });
            }
        } catch (error) {
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
        <Dialog open={open}>
            <DialogTitle>{t('acc.scan')}</DialogTitle>
            <DialogContent dividers>
                <DialogContentText mb={2}>
                    {t('acc.googleAuth1')}
                    <span style={{ color: '#1976d2' }}>
                        {t('acc.googleAuth')}
                    </span>{' '}
                    {t('acc.googleAuth2')}
                </DialogContentText>
                <Box
                    display={'flex'}
                    flexDirection={'column'}
                    alignItems={'center'}
                    mb={2}>
                    <Typography
                        fontSize={12}
                        fontWeight={'bold'}>
                        {t('acc.scanApp')}
                    </Typography>
                    <img
                        src={qrCode.qrCodeUrl}
                        alt={t('acc.qrcode')}
                        style={{ width: 200, height: 200 }}
                    />
                    <Button
                        variant={'outlined'}
                        sx={{ fontSize: 12 }}
                        onClick={handleOnCopy}>
                        {qrCode.secret}
                    </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box
                    display={'flex'}
                    flexDirection={'column'}
                    alignItems={'center'}>
                    <Typography
                        fontSize={12}
                        fontWeight={'bold'}
                        mb={1}>
                        {t('acc.enterCode')}
                    </Typography>
                    <Box
                        display={'flex'}
                        gap={1}
                        mb={2}>
                        {token.map((t, i) => (
                            <TextField
                                key={i}
                                value={t}
                                inputRef={(el) => (inputsRef.current[i] = el)}
                                size={'small'}
                                onChange={(e) => handle2FAChange(e, i)}
                                onKeyDown={(e) => handle2FAKeyDown(e, i)}
                                inputProps={{
                                    maxLength: 1,
                                    style: {
                                        textAlign: 'center',
                                        width: '10px'
                                    }
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleOnClose}
                    variant={'outlined'}
                    color={'error'}
                    sx={{ width: 100 }}>
                    {t('acc.cancel')}
                </Button>
                <Button
                    onClick={handleOnSubmit}
                    variant={'contained'}
                    color={'primary'}
                    sx={{ width: 100 }}>
                    {t('acc.submit')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalTwoFactorAuthentication;
