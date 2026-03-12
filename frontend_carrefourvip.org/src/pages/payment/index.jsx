import { Container, Box, Typography, Divider, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import assets from '../../assets';
import { useState } from 'react';
import api from '../../routes/api';
import { useEffect } from 'react';
import ModalViewImage from './ModalViewImage';
import ProductItem from './ProductItem';
import web from '../../routes/web';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

const PaymentPage = () => {
    const { id } = useParams();
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useSmartNavigate();
    const [order, setOrder] = useState(null);
    const [openImage, setOpenImage] = useState({ open: false, data: null });
    const [empty, setEmpty] = useState(false);

    useEffect(() => {
        loadOrderData();
    }, []);

    const loadOrderData = async () => {
        if (!id) return;

        const res = await api.orders.getPayOrder({ id });
        setEmpty(res.data === '' || res.data === null);
        setOrder(res.data);
    };

    return (
        <Container
            maxWidth={'sm'}
            sx={{ p: 2 }}>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                mb={2}>
                <img
                    src={assets.logo_white}
                    width={80}
                    onClick={() => navigate(web.home)}
                />
                <Typography
                    variant={'h4'}
                    fontWeight={'bold'}
                    color={'primary'}>
                    <span
                        style={{
                            display:
                                order?.paymentStatus === 'pending'
                                    ? 'inline'
                                    : 'none'
                        }}
                        translate={'no'}>
                        {order?.payAmount
                            ? useStyledLocaleString(
                                  order.payAmount,
                                  user?.geoInfo
                              )
                            : '0.00'}
                    </span>
                    <span
                        style={{
                            display:
                                order?.paymentStatus !== 'pending'
                                    ? 'inline'
                                    : 'none'
                        }}>
                        {order?.paymentStatus.toUpperCase()}
                    </span>
                </Typography>
            </Box>
            {!empty ? (
                order ? (
                    <Box>
                        <Typography
                            variant={'h5'}
                            mb={2}>
                            Products
                        </Typography>
                        <Box>
                            {order &&
                                order.items.map((item) => (
                                    <ProductItem
                                        key={item.id}
                                        data={item}
                                        setOpen={setOpenImage}
                                    />
                                ))}
                            <Divider sx={{ my: 2 }} />
                            <Box
                                display={'flex'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                                mb={1}>
                                <Typography variant={'body2'}>
                                    Sub Total:
                                </Typography>
                                <Typography
                                    variant={'body2'}
                                    translate={'no'}
                                    textAlign={'right'}>
                                    {useStyledLocaleString(
                                        order?.subtotal,
                                        user?.geoInfo
                                    )}
                                </Typography>
                            </Box>
                            <Box
                                display={'flex'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                                mb={1}>
                                <Typography variant={'body2'}>
                                    Delivery Fee:
                                </Typography>
                                <Typography
                                    variant={'body2'}
                                    translate={'no'}
                                    textAlign={'right'}>
                                    {useStyledLocaleString(
                                        order?.deliveryFee,
                                        user?.geoInfo
                                    )}
                                </Typography>
                            </Box>
                            {/* <Box
                                display={'flex'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                                mb={1}>
                                <Typography variant={'body2'}>
                                    Vat
                                    <span translate={'no'}>
                                        (
                                        {order?.subtotal === 0
                                            ? '0.00'
                                            : (
                                                  (order?.vat /
                                                      order?.subtotal) *
                                                  100
                                              ).toLocaleString(undefined, {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2
                                              })}
                                        %)
                                    </span>
                                    :
                                </Typography>
                                <Typography
                                    variant={'body2'}
                                    translate={'no'}
                                    textAlign={'right'}>
                                    {useStyledLocaleString(
                                        order?.vat,
                                        user?.geoInfo
                                    )}
                                </Typography>
                            </Box> */}
                            <Box
                                display={'flex'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                                mb={1}>
                                <Typography variant={'body2'}>
                                    Discount:
                                </Typography>
                                <Typography
                                    variant={'body2'}
                                    translate={'no'}
                                    textAlign={'right'}>
                                    -
                                    {useStyledLocaleString(
                                        Number(order?.discountPayPal) +
                                            Number(order?.balanceDeduct),
                                        user?.geoInfo
                                    )}
                                </Typography>
                            </Box>
                            <Box
                                display={'flex'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                                mb={1}>
                                <Typography variant={'body2'}>
                                    Amount Due:
                                </Typography>
                                <Typography
                                    variant={'body2'}
                                    translate={'no'}
                                    textAlign={'right'}>
                                    {useStyledLocaleString(
                                        order?.payAmount,
                                        user?.geoInfo
                                    )}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography
                                variant={'h5'}
                                mb={2}>
                                Delivery Address
                            </Typography>
                            <Box
                                display={'flex'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                                mb={1}>
                                <Typography variant={'body2'}>
                                    Recipient Name:
                                </Typography>
                                <Typography
                                    variant={'body2'}
                                    translate={'no'}
                                    textAlign={'right'}>
                                    {order?.userName}
                                </Typography>
                            </Box>
                            <Box
                                display={'flex'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                                mb={1}>
                                <Typography variant={'body2'}>
                                    Recipient Phone Number:
                                </Typography>
                                <Typography
                                    variant={'body2'}
                                    translate={'no'}
                                    textAlign={'right'}>
                                    {order?.userMobile}
                                </Typography>
                            </Box>
                            <Box
                                display={'flex'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                                mb={1}>
                                <Typography variant={'body2'}>
                                    Shipping Address:
                                </Typography>
                                <Typography
                                    variant={'body2'}
                                    translate={'no'}
                                    textAlign={'right'}>
                                    {order?.userAddress}
                                </Typography>
                            </Box>
                            <Box
                                display={'flex'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                                mb={1}>
                                <Typography variant={'body2'}>
                                    Shipping Method:
                                </Typography>
                                <Typography
                                    variant={'body2'}
                                    textAlign={'right'}>
                                    {order?.deliveryMethod === 'express'
                                        ? 'Express'
                                        : 'Standard'}
                                </Typography>
                            </Box>
                            <Box
                                display={'flex'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                                mb={1}>
                                <Typography variant={'body2'}>
                                    Payment Method:
                                </Typography>
                                <Typography
                                    variant={'body2'}
                                    textAlign={'right'}>
                                    {order?.payMethod}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box textAlign={'center'}>
                                <Button
                                    variant='contained'
                                    fullWidth
                                    onClick={() => {
                                        if (!order?.paymentLink) return;
                                        window.location.href =
                                            order?.paymentLink;
                                    }}>
                                    Go to the payment page
                                </Button>
                            </Box>
                            <Typography
                                variant={'body2'}
                                mt={2}>
                                This product is offered and sold by the seller
                                and is subject to their policies. Product
                                descriptions, images, and information are
                                provided by the seller and are not verified or
                                guaranteed.
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box
                        display={'flex'}
                        justifyContent={'center'}
                        alignItems={'center'}
                        height={'70vh'}>
                        <Typography
                            variant={'body2'}
                            color={'textSecondary'}>
                            Loading...
                        </Typography>
                    </Box>
                )
            ) : (
                <Box
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    height={'70vh'}>
                    <Typography
                        variant={'body2'}
                        color={'textSecondary'}
                        fontStyle={'italic'}>
                        No Data
                    </Typography>
                </Box>
            )}
            <ModalViewImage
                open={openImage.open}
                image={openImage.data}
                setOpen={setOpenImage}
            />
        </Container>
    );
};

export default PaymentPage;
