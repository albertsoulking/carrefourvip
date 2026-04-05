import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid
} from '@mui/material';
import { RestaurantRounded } from '@mui/icons-material';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

export default function ModalCreate({
    open,
    setOpen
}) {
    const [categoriesData, setCategoriesData] = useState([]);

    const items = [
        {
            name: 'name',
            label: '名称'
        },
        {
            name: 'categoryId',
            label: '分类 *',
            children: categoriesData
                ? categoriesData.map((c) => ({ label: c.name, value: c.id }))
                : []
        },
        {
            name: 'price',
            label: '价格',
            type: 'number'
        }
    ];
    const [formData, setFormData] = useState({});

    useEffect(() => {
        loadCategory();
    }, []);

    const loadCategory = async () => {
        const res = await api.category.get();
        setCategoriesData(res.data);
    };

    const handleOnClose = () => {
        setOpen(false);
        setFormData({});
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value ?? ''
        });
    };

    // Handle create team submission
    const handleCreateSubmit = async () => {
        try {
            await api.product.create(formData);
            setOpen(false);
            setFormData({});
            enqueueSnackbar('创建商品成功!', {
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
            aria-labelledby={'create-product-dialog-title'}>
            <DialogTitle
                id={'create-product-dialog-title'}
                sx={{
                    pb: 1,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiSvgIcon-root': { mr: 1 }
                }}>
                <RestaurantRounded color={'primary'} /> 添加新商品
            </DialogTitle>
            <DialogContent dividers>
                {items.map((item) => (
                    <Grid
                        size={{ xs: 12 }}
                        key={item.name}>
                        {item.children ? (
                            <FormControl
                                margin={'normal'}
                                fullWidth>
                                <InputLabel>{item.label}</InputLabel>
                                <Select
                                    {...item}
                                    value={formData[item.name] || ''}
                                    onChange={handleInputChange}>
                                    {item.children.map((child) => (
                                        <MenuItem
                                            value={child.value}
                                            key={child.value}>
                                            {child.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <TextField
                                {...item}
                                value={formData[item.name] || ''}
                                onChange={handleInputChange}
                                fullWidth
                                required
                                margin={'normal'}
                            />
                        )}
                    </Grid>
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
