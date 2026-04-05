import { useEffect, useState } from 'react';
import { TextField, IconButton, Typography, Box } from '@mui/material';
import { RemoveRounded, AddRounded, DeleteRounded } from '@mui/icons-material';
import api from '../../routes/api';
import web from '../../routes/web';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

const CartItem = ({ data, setOpen, loadCartData }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useSmartNavigate();
    const [quantity, setQuantity] = useState(data.quantity);

    useEffect(() => {
        setQuantity(data.quantity);
    }, [data.quantity]);
    
    const onUpdateQuantity = async (newQuantity) => {
        setQuantity(newQuantity);

        const payload = {
            id: data.id,
            quantity: newQuantity
        };
        try {
            await api.carts.updateQuantity(payload);
            loadCartData();
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

    const onDeleteCart = async () => {
        const payload = {
            id: data.id
        };
        
        try {
            await api.carts.deleteOne(payload);
            loadCartData();
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
        <Box
            display={'flex'}
            alignItems={'center'}
            justifyContent={'space-between'}
            p={1}
            sx={{ borderBottom: '1px solid #eee' }}>
            {/* 左边：复选框 + 图片 + 商品名 + 价格 */}
            <Box
                display={'flex'}
                alignItems={'center'}
                gap={1}
                flex={'1 1 auto'}
                minWidth={0}
                onClick={() => {
                    setOpen(false);
                    if (!data.product) return;
                    navigate(web.productDetail(data.product.id));
                }}>
                <Box
                    component={'img'}
                    src={`${import.meta.env.VITE_API_BASE_URL}/uploads/thumbs/${
                        data.product.imageUrl
                    }`}
                    alt={data.product.name}
                    sx={{ width: 40, height: 40, borderRadius: 1 }}
                />
                <Box
                    ml={1}
                    minWidth={0}>
                    <Typography
                        variant={'body2'}
                        fontWeight={500}
                        noWrap
                        sx={{
                            maxWidth: '120px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                        <span
                            style={{
                                display: data.product.name ? 'inline' : 'none'
                            }}>
                            {data.product.name}
                        </span>
                    </Typography>
                    <Typography
                        variant={'body2'}
                        color={'text.secondary'}
                        translate={'no'}>
                        {useStyledLocaleString(data.unitPrice, user?.geoInfo)}
                    </Typography>
                </Box>
            </Box>

            {/* 右边：数量控制 */}
            <Box
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'center'}
                alignItems={'center'}>
                <Typography
                    variant={'body2'}
                    color={'text.secondary'}
                    fontSize={12}
                    translate={'no'}>
                    {useStyledLocaleString(data.totalPrice, user?.geoInfo)}
                </Typography>
                <Box
                    display={'flex'}
                    alignItems={'center'}
                    border={'1px solid #ccc'}
                    borderRadius={2}>
                    {quantity === 1 ? (
                        <IconButton
                            size={'small'}
                            onClick={onDeleteCart}>
                            <DeleteRounded fontSize={'small'} />
                        </IconButton>
                    ) : (
                        <IconButton
                            size={'small'}
                            onClick={() =>
                                onUpdateQuantity(Math.max(1, quantity - 1))
                            }>
                            <RemoveRounded fontSize={'small'} />
                        </IconButton>
                    )}
                    <TextField
                        translate={'no'}
                        value={quantity}
                        variant={'standard'}
                        type={'number'}
                        inputProps={{
                            style: {
                                textAlign: 'center',
                                width: 24,
                                padding: 0,
                                fontSize: 14
                            }
                        }}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 1)
                                setQuantity(Math.max(1, Math.min(99, val)));
                        }}
                        onBlur={() => onUpdateQuantity(quantity)}
                    />
                    <IconButton
                        size={'small'}
                        onClick={() =>
                            onUpdateQuantity(Math.min(99, quantity + 1))
                        }>
                        <AddRounded fontSize={'small'} />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default CartItem;
