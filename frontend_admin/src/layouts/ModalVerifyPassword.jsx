import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material';
import { useState } from 'react';
import api from '../routes/api';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';

const ModalVerifyPassword = ({
    open,
    setOpen,
    data,
    setOpenAccountSetting,
    setOpenAddTwoFactor,
    setOpenRemoveTwoFactor
}) => {
    const { t } = useTranslation();
    const [value, setValue] = useState('');

    const handleOnClose = () => {
        setValue('');
        setOpen({ open: false, data: null });
        setOpenAccountSetting({
            open: true,
            data: { ...data, twoFactorEnabled: 0 }
        });
    };

    const handleOnChangePassword = async () => {
        if (value === '') {
            enqueueSnackbar('请输入密码!', {
                variant: 'success'
            });
            return;
        }

        try {
            const payload = {
                password: value
            };

            await api.twoFactor.verifyAdmin(payload);
            if (data?.twoFactorEnabled === 1) {
                setOpenAddTwoFactor({ open: true, data });
            } else {
                setOpenRemoveTwoFactor({ open: true, data });
            }
            setOpen({ open: false, data: null });
            setValue('');
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
            <DialogTitle>
                {data?.twoFactorEnabled ? t('acc.add2fa') : t('acc.remove2fa')}
            </DialogTitle>
            <DialogContent dividers>
                <TextField
                    name={'email'}
                    label={t('acc.email')}
                    value={data?.email ?? ''}
                    fullWidth
                    margin={'normal'}
                    disabled
                />
                <TextField
                    required
                    name={'password'}
                    label={t('acc.pass')}
                    value={value}
                    type={'password'}
                    fullWidth
                    margin={'normal'}
                    onChange={(e) => setValue(e.target.value)}
                />
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
                    onClick={handleOnChangePassword}
                    variant={'contained'}
                    color={'primary'}
                    sx={{ width: 100 }}>
                    {t('acc.submit')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalVerifyPassword;
