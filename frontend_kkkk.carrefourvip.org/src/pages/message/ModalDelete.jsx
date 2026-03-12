import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    DialogContentText
} from '@mui/material';
import { DeleteRounded } from '@mui/icons-material';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

export default function ModalDelete({
    open,
    data,
    setOpen
}) {
    const handleOnSubmit = async () => {
        if (!data) return;

        const payload = {
            id: data?.id
        };

        try {
            await api.ticket.delete(payload);
            setOpen(false);
            enqueueSnackbar('删除成功!', {
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
            open={open}
            maxWidth={'sm'}
            fullWidth
            container={document.body}
            disablePortal={false}
            aria-labelledby={'delete-customer-dialog-title'}>
            <DialogTitle
                id={'delete-customer-dialog-title'}
                sx={{
                    pb: 1,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiSvgIcon-root': { mr: 1 }
                }}>
                <DeleteRounded color={'error'} /> 删除工单
            </DialogTitle>
            <DialogContent dividers>
                <DialogContentText>
                    你确定要删除该消息工单吗？
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={() => setOpen(false)}
                    variant={'outlined'}
                    color={'error'}
                    sx={{ width: 100 }}>
                    取消
                </Button>
                <Button
                    onClick={handleOnSubmit}
                    variant={'contained'}
                    color={'primary'}
                    sx={{ width: 100 }}>
                    确认
                </Button>
            </DialogActions>
        </Dialog>
    );
}
