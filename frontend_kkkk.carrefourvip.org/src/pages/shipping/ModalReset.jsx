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
                key: 'delivery',
                value: JSON.stringify({
                    deliveryRules: [],
                    restrictedCountries: [],
                    businessHours:[
                        { name: 'monday', open: '', close: ''}, // 周一
                        { name: 'tuesday', open: '', close: ''}, // 周二
                        { name: 'wednesday', open: '', close: ''}, // 周三
                        { name: 'thursday', open: '', close: ''}, // 周四
                        { name: 'friday', open: '', close: ''}, // 周五
                        { name: 'saturday', open: '', close: ''}, // 周六
                        { name: 'sunday', open: '', close: ''}, // 周日
                    ]
                }),
                remark: '配送设置'
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
            <DialogTitle>重置配送设置</DialogTitle>
            <DialogContent dividers>
                是否要重置配送设置？目前所有的信息都会被清空。
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
