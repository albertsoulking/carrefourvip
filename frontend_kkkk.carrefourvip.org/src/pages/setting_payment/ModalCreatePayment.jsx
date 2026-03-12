import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import {
    CategoryRounded
} from '@mui/icons-material';
import api from '../../routes/api';
import InputField from '../../components/InputField';
import { enqueueSnackbar } from 'notistack';

export default function ModalCreate({
    open,
    setOpen,
    loadData,
    searchModal
}) {
    const [formData, setFormData] = useState({});
    const [providers, setProviders] = useState([]);
    
    const items = [
        {
            name: 'name',
            label: '名称',
            element: 'text',
            required: true,
            helperText: '仅英文-显示在前端'
        },
        {
            name: 'providerId',
            label: '供应商',
            element: 'select',
            required: true,
            children: providers.map((p) => ({ label: p.name, value: p.id }))
        }
    ];

    useEffect(() => {
        loadProvider();
    }, []);

    const loadProvider = async () => {
        const res = await api.provider.getAll();
        setProviders(res.data);
    };

    const handleOnClose = () => {
        setOpen(false);
        setFormData({});
    };

    const handleOnChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value ?? ''
        });
    };

    // Handle create team submission
    const handleCreateSubmit = async () => {
        try {
            await api.gateway.create(formData);
            loadData(searchModal);
            setOpen(false);
            setFormData({});
            enqueueSnackbar('创建成功!', {
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
            onClose={handleOnClose}
            maxWidth={'sm'}
            fullWidth
            container={document.body}
            disablePortal={false}>
            <DialogTitle
                sx={{
                    pb: 1,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiSvgIcon-root': { mr: 1 }
                }}>
                <CategoryRounded color={'primary'} /> 添加新支付
            </DialogTitle>
            <DialogContent dividers>
                {items.map((item) => (
                    <InputField
                        key={item.name}
                        field={item}
                        value={formData[item.name]}
                        onChange={handleOnChange}
                    />
                ))}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={handleOnClose}
                    variant={'outlined'}
                    color={'error'}
                    sx={{ width: 100 }}>
                    取消
                </Button>
                <Button
                    onClick={handleCreateSubmit}
                    variant={'contained'}
                    color={'primary'}
                    sx={{ width: 100 }}>
                    创建
                </Button>
            </DialogActions>
        </Dialog>
    );
}
