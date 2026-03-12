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
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const ModalChangePassword = ({
    open,
    setOpen,
    data,
    setOpenAccountSetting
}) => {
    const { t } = useTranslation();
    const [newPassword, setNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');

    const handleOnClose = () => {
        setNewPassword('');
        setOldPassword('');
        setOpen({ open: false, data: null });
        setOpenAccountSetting({ open: true, data });
    };

    const handleOnChangePassword = async () => {
        if (newPassword === '' || oldPassword === '') {
            enqueueSnackbar('请输入密码!', {
                variant: 'error'
            });
            return;
        }

        try {
            const payload = {
                oldPassword,
                newPassword,
                userType: 'admin'
            };

            await api.auth.changePassword(payload);
            setOpen({ open: false, data: null });
            setNewPassword('');
            setOldPassword('');
            enqueueSnackbar('密码已更新!', {
                variant: 'success'
            });
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
            <DialogTitle>{t('acc.changePass')}</DialogTitle>
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
                    name={'oldPassword'}
                    label={'旧密码'}
                    value={oldPassword}
                    fullWidth
                    margin={'normal'}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
                <TextField
                    required
                    name={'newPassword'}
                    label={'新密码'}
                    value={newPassword}
                    fullWidth
                    margin={'normal'}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleOnClose}
                    variant={'outlined'}
                    color={'error'}
                    sx={{ width: 100, textTransform: 'capitalize' }}>
                    {t('acc.cancel')}
                </Button>
                <Button
                    onClick={handleOnChangePassword}
                    variant={'contained'}
                    color={'primary'}
                    sx={{ width: 100, textTransform: 'capitalize' }}>
                    {t('acc.submit')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalChangePassword;
