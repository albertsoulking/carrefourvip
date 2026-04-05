import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material';
import { useState } from 'react';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

const ModalChangePassword = ({ open, setOpen, data }) => {
    const [value, setValue] = useState('');

    const handleOnClose = () => {
        setValue('');
        setOpen(false);
    };

    const handleOnChangePassword = async () => {
        if (value === '') {
            enqueueSnackbar('密码无效!', {
                variant: 'error'
            });
            return;
        }

        try {
            const payload = {
                id: data?.id,
                password: value
            };

            await api.user.changePassword(payload);
            setOpen(false);
            setValue('');
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
        <Dialog
            open={open}>
            <DialogTitle>更改密码</DialogTitle>
            <DialogContent dividers>
                <TextField
                    name={'email'}
                    label={'邮箱'}
                    value={data?.email ?? ''}
                    fullWidth
                    margin={'normal'}
                    disabled
                />
                <TextField
                    required
                    name={'password'}
                    label={'密码'}
                    value={value}
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
                    取消
                </Button>
                <Button
                    onClick={handleOnChangePassword}
                    variant={'contained'}
                    color={'primary'}
                    sx={{ width: 100 }}>
                    提交
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalChangePassword;
