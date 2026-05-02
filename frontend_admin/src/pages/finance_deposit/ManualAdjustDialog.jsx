import { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import api from '../../routes/api';

export default function ManualAdjustDialog({ open, onClose, onSuccess }) {
    const [userId, setUserId] = useState('');
    const [amount, setAmount] = useState('');
    const [direction, setDirection] = useState('in');
    const [remark, setRemark] = useState('');
    const [busy, setBusy] = useState(false);

    const handleClose = () => {
        if (busy) return;
        setUserId('');
        setAmount('');
        setDirection('in');
        setRemark('');
        onClose();
    };

    const handleSubmit = async () => {
        const uid = Number(userId, 10);
        const amt = Number(amount);
        if (!uid || Number.isNaN(uid)) {
            enqueueSnackbar('请输入有效用户 ID', { variant: 'warning' });
            return;
        }
        if (!amt || Number.isNaN(amt) || amt <= 0) {
            enqueueSnackbar('请输入有效金额', { variant: 'warning' });
            return;
        }
        if (!remark || remark.trim().length < 3) {
            enqueueSnackbar('备注至少 3 个字符', { variant: 'warning' });
            return;
        }
        setBusy(true);
        try {
            await api.transactions.adjustBalance({
                userId: uid,
                amount: amt,
                direction,
                remark: remark.trim()
            });
            enqueueSnackbar('调账成功', { variant: 'success' });
            handleClose();
            onSuccess?.();
        } catch (error) {
            enqueueSnackbar(
                Array.isArray(error.response?.data?.message)
                    ? error.response.data.message[0]
                    : error.response?.data?.message ||
                          error.message ||
                          '调账失败',
                { variant: 'error' }
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={'sm'}
            fullWidth>
            <DialogTitle>手工调账（增减余额）</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <TextField
                    label={'用户 ID'}
                    value={userId}
                    type={'number'}
                    size={'small'}
                    fullWidth
                    onChange={(e) => setUserId(e.target.value)}
                />
                <TextField
                    label={'金额 (正数)'}
                    value={amount}
                    type={'number'}
                    size={'small'}
                    fullWidth
                    inputProps={{ min: 0, step: '0.01' }}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <TextField
                    select
                    label={'方向'}
                    value={direction}
                    size={'small'}
                    fullWidth
                    onChange={(e) => setDirection(e.target.value)}>
                    <MenuItem value={'in'}>增加余额（入账）</MenuItem>
                    <MenuItem value={'out'}>减少余额（扣款）</MenuItem>
                </TextField>
                <TextField
                    label={'备注（必填）'}
                    value={remark}
                    multiline
                    minRows={2}
                    size={'small'}
                    fullWidth
                    onChange={(e) => setRemark(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}
                    disabled={busy}>
                    取消
                </Button>
                <Button
                    variant={'contained'}
                    onClick={handleSubmit}
                    disabled={busy}>
                    确认
                </Button>
            </DialogActions>
        </Dialog>
    );
}
