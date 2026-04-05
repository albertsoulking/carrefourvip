import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import api from '../routes/api';
import { useEffect, useState } from 'react';

export default function ModalProfile({ open, setOpen }) {
    const user = JSON.parse(localStorage.getItem('user'));
    const { t } = useTranslation();
    const [name, setName] = useState(user?.name || '');

    useEffect(() => {
        setName(user?.name || '');
    }, []);

    const onSave = async () => {
        try {
            const payload = {
                id: user?.id,
                name
            };

            await api.agent.updateProfile(payload);
            localStorage.setItem('user', JSON.stringify({ ...user, name }));
            setOpen(false);
            setName('');
            enqueueSnackbar('资料已更新!', {
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
            <DialogTitle>个人资料</DialogTitle>
            <DialogContent dividers>
                <TextField
                    label={'账号'}
                    value={user?.email || ''}
                    fullWidth
                    margin={'normal'}
                    size={'small'}
                    disabled
                />
                <TextField
                    label={'名称'}
                    value={name || ''}
                    fullWidth
                    margin={'normal'}
                    size={'small'}
                    onChange={(e) => setName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant={'outlined'}
                    color={'error'}
                    size={'small'}
                    sx={{ width: 100, textTransform: 'capitalize' }}
                    onClick={() => setOpen(false)}>
                    {t('acc.cancel')}
                </Button>
                <Button
                    variant={'contained'}
                    color={'primary'}
                    size={'small'}
                    sx={{ width: 100, textTransform: 'capitalize' }}
                    onClick={onSave}>
                    保存
                </Button>
            </DialogActions>
        </Dialog>
    );
}
