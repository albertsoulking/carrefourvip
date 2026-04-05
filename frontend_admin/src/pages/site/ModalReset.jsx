import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import api from '../../routes/api';

export default function ModalReset({ open, setOpen, loadData }) {
    const onReset = async () => {
        try {
            const payload = {
                group: 'setting',
                key: 'website',
                value: JSON.stringify({
                    logo: '',
                    homepageBanner: '',
                    vatEnabled: true,
                    deliveryFeeEnabled: true,
                    deliveryAddressEnabled: true
                }),
                remark: '网站通用设置'
            };

            await api.settings.reset(payload);
            setOpen(false);
            loadData();
            enqueueSnackbar('已重置!', {
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
            <DialogTitle>重置网站设置</DialogTitle>
            <DialogContent dividers>
                是否要重置网站设置？目前所有的信息都会被重置包括图片。
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => setOpen(false)}
                    variant={'outlined'}
                    color={'error'}
                    sx={{ width: 100 }}>
                    取消
                </Button>
                <Button
                    onClick={onReset}
                    variant={'contained'}
                    sx={{ width: 100 }}>
                    确认
                </Button>
            </DialogActions>
        </Dialog>
    );
}
