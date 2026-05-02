import { useMemo, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import api from '../../routes/api';

function resolveProofUrl(row) {
    if (row.proofImageUrl) return row.proofImageUrl;
    if (row.proofImage) {
        const base = import.meta.env.VITE_API_BASE_URL || '';
        return `${base.replace(/\/$/, '')}/uploads/images/${row.proofImage}`;
    }
    return null;
}

export default function DepositRowActions({ row, onRefresh }) {
    const [rejectOpen, setRejectOpen] = useState(false);
    const [approveOpen, setApproveOpen] = useState(false);
    const [proofOpen, setProofOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [busy, setBusy] = useState(false);

    const proofUrl = useMemo(
        () => resolveProofUrl(row),
        [row.proofImage, row.proofImageUrl]
    );

    const canApproveReject =
        row.status === 'pending' && row.method === 'bank_transfer';

    const handleApprove = async () => {
        setBusy(true);
        try {
            await api.transactions.approveBankDeposit({ id: row.id });
            enqueueSnackbar('已批准入账', { variant: 'success' });
            setApproveOpen(false);
            onRefresh?.();
        } catch (error) {
            enqueueSnackbar(
                error.response?.data?.message || error.message || '操作失败',
                { variant: 'error' }
            );
        } finally {
            setBusy(false);
        }
    };

    const handleReject = async () => {
        setBusy(true);
        try {
            await api.transactions.rejectBankDeposit({
                id: row.id,
                reason: reason || undefined
            });
            enqueueSnackbar('已拒绝该笔充值', { variant: 'success' });
            setRejectOpen(false);
            setReason('');
            onRefresh?.();
        } catch (error) {
            enqueueSnackbar(
                error.response?.data?.message || error.message || '操作失败',
                { variant: 'error' }
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <Box
            display={'flex'}
            flexWrap={'wrap'}
            gap={0.5}
            alignItems={'center'}>
            {proofUrl && (
                <Button
                    size={'small'}
                    variant={'text'}
                    sx={{ fontSize: 11, minWidth: 0, px: 0.5 }}
                    onClick={() => setProofOpen(true)}>
                    凭证
                </Button>
            )}
            {canApproveReject && (
                <>
                    <Button
                        size={'small'}
                        variant={'contained'}
                        color={'primary'}
                        disabled={busy}
                        sx={{ fontSize: 11, minWidth: 0, px: 1 }}
                        onClick={() => setApproveOpen(true)}>
                        通过
                    </Button>
                    <Button
                        size={'small'}
                        variant={'outlined'}
                        color={'error'}
                        disabled={busy}
                        sx={{ fontSize: 11, minWidth: 0, px: 1 }}
                        onClick={() => setRejectOpen(true)}>
                        拒绝
                    </Button>
                </>
            )}
            {!proofUrl && !canApproveReject && (
                <Typography
                    fontSize={12}
                    color={'text.secondary'}>
                    —
                </Typography>
            )}

            <Dialog
                open={proofOpen}
                onClose={() => setProofOpen(false)}
                maxWidth={'md'}
                fullWidth>
                <DialogTitle>转账凭证</DialogTitle>
                <DialogContent>
                    {proofUrl ? (
                        <Box
                            component={'img'}
                            src={proofUrl}
                            alt={'proof'}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '70vh',
                                objectFit: 'contain',
                                display: 'block',
                                mx: 'auto',
                                mt: 1
                            }}
                        />
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setProofOpen(false)}>关闭</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={approveOpen}
                onClose={() => !busy && setApproveOpen(false)}
                maxWidth={'xs'}
                fullWidth>
                <DialogTitle>确认通过</DialogTitle>
                <DialogContent>
                    <Typography
                        variant={'body2'}
                        sx={{ mt: 1 }}>
                        确认通过该笔银行转账充值？用户余额将增加对应金额。
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setApproveOpen(false)}
                        disabled={busy}>
                        取消
                    </Button>
                    <Button
                        variant={'contained'}
                        color={'primary'}
                        onClick={handleApprove}
                        disabled={busy}>
                        确认通过
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={rejectOpen}
                onClose={() => !busy && setRejectOpen(false)}
                maxWidth={'xs'}
                fullWidth>
                <DialogTitle>拒绝充值</DialogTitle>
                <DialogContent>
                    <TextField
                        label={'原因（可选）'}
                        value={reason}
                        fullWidth
                        multiline
                        minRows={2}
                        size={'small'}
                        sx={{ mt: 1 }}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setRejectOpen(false)}
                        disabled={busy}>
                        取消
                    </Button>
                    <Button
                        variant={'contained'}
                        color={'error'}
                        onClick={handleReject}
                        disabled={busy}>
                        确认拒绝
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
