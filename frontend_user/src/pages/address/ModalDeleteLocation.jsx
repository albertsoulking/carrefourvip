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
import { useTranslation } from 'react-i18next';

const ModalDeleteLocation = ({
    open,
    data,
    setOpen,
    loadData,
    setSelectedAddress
}) => {
    const { t } = useTranslation();
    const handleOnDeleteClick = async () => {
        if (!data || !data.id) {
            enqueueSnackbar(t('address.noAddressSelected'), {
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
                <span>{t('address.deleteTitle')}</span>
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
                    {t('address.deleteConfirm')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant={'contained'}
                    sx={{
                        textTransform: 'capitalize'
                    }}
                    onClick={handleOnDeleteClick}>
                    {t('common.delete')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalDeleteLocation;
