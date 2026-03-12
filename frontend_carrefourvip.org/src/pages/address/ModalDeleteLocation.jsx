import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Button,
    DialogContentText,
    DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

const ModalDeleteLocation = ({
    open,
    data,
    setOpen,
    loadData,
    setSelectedAddress
}) => {
    const handleOnDeleteClick = async () => {
        if (!data || !data.id) {
            enqueueSnackbar('No address selected for deletion.!', {
                variant: 'error'
            });
            return;
        }

        try {
            await api.locations.deleteOne({ id: data.id });
            setSelectedAddress(null);
            loadData();
            setOpen({ open: false, data: null });
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
            fullWidth>
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 0
                }}>
                <span>Delete Address</span>
                <IconButton
                    color={'error'}
                    onClick={() => setOpen({ open: false, data: null })}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent
                sx={{ pb: 0 }}
                dividers>
                <DialogContentText mb={2}>
                    Are you sure you want to delete this address?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant={'contained'}
                    sx={{
                        textTransform: 'capitalize'
                    }}
                    onClick={handleOnDeleteClick}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalDeleteLocation;
