import { useEffect, useRef, useState } from 'react';
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
    Grid,
    Box,
    InputAdornment,
    IconButton,
    Avatar
} from '@mui/material';
import {
    DeleteRounded,
    PostAddRounded,
    UploadRounded
} from '@mui/icons-material';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

export default function ModalCreate({ open, setOpen }) {
    const [testUserData, setTestUserData] = useState([]);
    const inputRef = useRef();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [openImageViewer, setOpenImageViewer] = useState(false);
    const items = [
        {
            name: 'productName',
            label: '名称'
        },
        {
            name: 'quantity',
            label: '数量',
            type: 'number'
        },
        {
            name: 'payAmount',
            label: '价格',
            type: 'number'
        },
        {
            name: 'deliveryMethod',
            label: '送货方式 *',
            children: [
                {
                    label: '标准配送',
                    value: 'standard'
                },
                {
                    label: '快递配送',
                    value: 'express'
                }
            ]
        },
        {
            name: 'payMethod',
            label: '支付方式 *',
            children: [
                {
                    label: 'PayPal支付',
                    value: 'paypal'
                },
                {
                    label: 'Wise支付',
                    value: 'wise'
                }
            ]
        },
        {
            name: 'userName',
            label: '收件人名称'
        },
        {
            name: 'userMobile',
            label: '收件人电话'
        },
        {
            name: 'userAddress',
            label: '收件人地址'
        },
        {
            name: 'userId',
            label: '指定用户 *',
            children: testUserData
                ? testUserData.map((c) => ({ label: c.name, value: c.id }))
                : []
        }
    ];
    const [formData, setFormData] = useState({});

    useEffect(() => {
        loadTestUser();
    }, []);

    const loadTestUser = async () => {
        const payload = {
            mode: 'test',
            page: 1,
            limit: 100,
            orderBy: 'asc',
            sortBy: 'name'
        }

        const res = await api.user.getAll(payload);
        setTestUserData(res.data.data);
    };

    const handleOnClose = () => {
        setOpen(false);
        setFormData({});
        setFile(null);
        setPreviewUrl('');
        inputRef.current.value = '';
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
            await api.orders.create(formData);
            handleOnClose();
            enqueueSnackbar('创建订单成功!', {
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
            aria-labelledby={'create-order-dialog-title'}>
            <DialogTitle
                id={'create-order-dialog-title'}
                sx={{
                    pb: 1,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiSvgIcon-root': { mr: 1 }
                }}>
                <PostAddRounded color={'primary'} /> 添加新订单
            </DialogTitle>
            <DialogContent dividers>
                <Box
                    display={'flex'}
                    alignItems={'center'}
                    gap={1}>
                    {/* Hidden File Input */}
                    <input
                        ref={inputRef}
                        type={'file'}
                        accept={'image/*'}
                        onChange={async (event) => {
                            const file = event.target.files[0];

                            if (!file) return;

                            setFile(file);
                            setPreviewUrl(URL.createObjectURL(file));

                            const imageData = new FormData();
                            imageData.append('file', file);

                            const res = await api.utilities.upload(imageData);

                            handleInputChange({
                                target: {
                                    name: 'imageUrl',
                                    value: res.data.name
                                }
                            });
                        }}
                        style={{ display: 'none' }}
                    />
                    {/* Fake TextField */}
                    <TextField
                        fullWidth
                        margin={'normal'}
                        label={'上传图片 *'}
                        value={
                            previewUrl === ''
                                ? ''
                                : file?.name || data?.deliveryProofImages || ''
                        }
                        placeholder={'选择图片'}
                        InputProps={{
                            readOnly: true,
                            startAdornment: previewUrl && (
                                <InputAdornment position={'start'}>
                                    <Avatar
                                        src={previewUrl}
                                        variant={'rounded'}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            mr: 1,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => {
                                            setPreviewUrl(
                                                `${
                                                    import.meta.env
                                                        .VITE_API_BASE_URL
                                                }/uploads/images/${
                                                    data?.deliveryProofImages
                                                }`
                                            );
                                            setOpenImageViewer(true);
                                        }}
                                    />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position={'end'}>
                                    {previewUrl && (
                                        <IconButton
                                            onClick={() => {
                                                setFile(null);
                                                setPreviewUrl('');
                                                inputRef.current.value = '';

                                                handleInputChange({
                                                    target: {
                                                        name: 'imageUrl',
                                                        value: ''
                                                    }
                                                });
                                            }}>
                                            <DeleteRounded />
                                        </IconButton>
                                    )}
                                    <IconButton
                                        onClick={() =>
                                            inputRef.current.click()
                                        }>
                                        <UploadRounded />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
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
            <Dialog
                open={openImageViewer}
                onClose={() => setOpenImageViewer(false)}>
                <img
                    src={previewUrl}
                    alt={previewUrl}
                    style={{ objectFit: 'contain', borderRadius: 4 }}
                    onClick={() => setOpenImageViewer(false)}
                />
            </Dialog>
        </Dialog>
    );
}
