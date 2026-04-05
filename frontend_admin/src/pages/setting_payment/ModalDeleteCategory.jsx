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

export default function ModalDeleteCategory({
    open,
    data,
    setOpen,
    loadData,
    searchModal
}) {
    // Handle create team submission
    const handleOnSubmit = async () => {
        if (!data) return;

        const payload = {
            id: data?.id
        };

        try {
            await api.category.delete(payload);
            loadData(searchModal);
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
            onClose={() => setOpen({ open: false, data: null })}
            maxWidth={'sm'}
            fullWidth
            container={document.body}
            disablePortal={false}
            aria-labelledby={'delete-category-dialog-title'}>
            <DialogTitle
                id={'delete-category-dialog-title'}
                sx={{
                    pb: 1,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiSvgIcon-root': { mr: 1 }
                }}>
                <DeleteRounded color={'error'} /> 删除分类
            </DialogTitle>
            <DialogContent dividers>
                <DialogContentText>
                    你确定要删除该商品分类吗？
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={() => setOpen({ open: false, data: null })}
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
