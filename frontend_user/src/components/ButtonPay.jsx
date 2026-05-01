import {
    CircularProgress,
    Box,
    Button,
    Divider,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import useStyledLocaleString from '../hooks/useStyledLocaleString';
import { enqueueSnackbar } from 'notistack';
import ModalOrderCheckout from './ModalOrderCheckout';

const ButtonPay = ({
    data,
    selectedIds,
    selectedAddress,
    setOpenCart,
    shippingFee,
    siteData,
    deliveryData
}) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [loading, setLoading] = useState(false);
    const [isAllowed, setIsAllowed] = useState(false);
    const [openOrderCheckout, setOpenOrderCheckout] = useState({
        open: false,
        data: null
    });

    useEffect(() => {
        const allow = isAllowedAddress();
        setIsAllowed(allow);
    }, [selectedAddress]);

    const isAllowedAddress = () => {
        const isEmpty = (obj) => obj && Object.entries(obj).length === 0;
        if (isEmpty(deliveryData) || !deliveryData) return;

        const restrictedCountries = normalizeArray(
            deliveryData.restrictedCountries
        );
        if (restrictedCountries.length === 0 || !selectedAddress) return false;

        const city = selectedAddress?.city.trim().toLowerCase();
        const country = selectedAddress?.country.trim().toLowerCase();

        if (!city || !country) return false;

        const restricted = restrictedCountries.find(
            (item) =>
                item.city.trim().toLowerCase() === city &&
                item.country.trim().toLowerCase() === country
        );

        if (!restricted) return false;

        return true;
    };

    const normalizeArray = (input) => {
        if (Array.isArray(input)) {
            return input;
        }

        if (typeof input === 'string') {
            try {
                const parsed = JSON.parse(input);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('normalizeArray - Invalid JSON:', e);
                return [];
            }
        }

        return [];
    };

    const handleOnClick = async () => {
        if (!user) {
            enqueueSnackbar('Login Expired, Please Login Again!', {
                variant: 'error'
            });
            return;
        }

        if (data && data.length === 0) {
            enqueueSnackbar('There are currently no products here!', {
                variant: 'info'
            });
            return;
        }

        if (selectedIds && selectedIds.length === 0) {
            enqueueSnackbar('Please select at least one product!', {
                variant: 'info'
            });
            return;
        }

        if (!selectedAddress && siteData.deliveryAddressEnabled) {
            enqueueSnackbar('Please select at least one address!', {
                variant: 'info'
            });
            return;
        }

        // if (!isAllowed && siteData.deliveryAddressEnabled) {
        //     enqueueSnackbar(
        //         'This address is not within the delivery service area!',
        //         {
        //             variant: 'error'
        //         }
        //     );
        //     return;
        // }

        setLoading(true);

        const payload = {
            userAddress: siteData.deliveryAddressEnabled
                ? `${selectedAddress?.address}/
                ${selectedAddress?.city}/
                ${selectedAddress?.state}/
                ${selectedAddress?.country}`
                : '-',
            userMobile: siteData.deliveryAddressEnabled
                ? selectedAddress?.receiverMobile
                : '-',
            userName: siteData.deliveryAddressEnabled
                ? selectedAddress?.receiverName
                : '-',
            imageUrl: data.find((cart) => selectedIds.includes(cart.id))
                ?.imageUrl,
            quantity: getQuantity(),
            subtotal: getSubtotal().toString(),
            vat: getVAT().toString(),
            deliveryFee: getDeliveryFee().toString(),
            totalPrice: getTotal().toString(),
            selectedItems: selectedIds,
            deliveryMethod: shippingFee.type,
            siteData
        };

        try {
            setTimeout(() => {
                setLoading(false);
                setOpenCart(false);
                setOpenOrderCheckout({ open: true, data: payload });
            }, 500);
        } catch (error) {
            setLoading(false);
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

    const getQuantity = () => {
        let totalProduct = 0;

        totalProduct = data
            .filter((item) => selectedIds.includes(item.id))
            .reduce((sum, curr) => sum + curr.quantity, 0);

        return totalProduct;
    };

    const getSubtotal = () => {
        let subtotal = 0;

        subtotal = data
            .filter((item) => selectedIds.includes(item.id))
            .reduce((sum, curr) => sum + Number(curr.totalPrice), 0);

        return subtotal;
    };

    const getDeliveryFee = () => {
        let fees = user && selectedIds.length ? shippingFee.fees : 0;

        return siteData.deliveryFeeEnabled ? fees : 0;
    };

    const getVAT = () => {
        let vat = 0;

        vat = data
            .filter((item) => selectedIds.includes(item.id))
            .reduce(
                (sum, curr) =>
                    sum +
                    curr.quantity *
                        Number(curr.product.price) *
                        (Number(
                            curr.product.category.isCollect
                                ? curr.product.category.vatPercent
                                : 0
                        ) /
                            100),
                0
            );
        return siteData.vatEnabled ? vat : 0;
    };

    const getTotal = () => {
        let total = 0;

        total = getSubtotal() + getDeliveryFee() + getVAT();

        return total;
    };

    return (
        <Box
            display={'flex'}
            flexDirection={'column'}
            sx={{
                position: 'sticky',
                bottom: 0,
                zIndex: 4,
                bgcolor: 'var(--brand-paper)',
                borderTop: '1px solid var(--brand-line)',
                boxShadow: 'var(--brand-shadow)'
            }}>
            <Box sx={{ px: 2, pt: 1.25 }}>
                <Typography
                    fontSize={12}
                    textAlign={'center'}
                    color={'error'}
                    my={0.5}>
                    * Special event, 10 points cashback for every 100 euros
                    spent *
                </Typography>
                <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    sx={{ color: 'var(--brand-ink)' }}>
                    <Typography
                        fontSize={14}
                        fontWeight={'normal'}>
                        Subtotal:
                    </Typography>
                    <Typography
                        fontSize={14}
                        fontWeight={'normal'}
                        translate={'no'}>
                        {useStyledLocaleString(getSubtotal(), user?.geoInfo)}
                    </Typography>
                </Box>
                {siteData.deliveryFeeEnabled && (
                    <Box
                        display={'flex'}
                        justifyContent={'space-between'}
                        sx={{ color: 'var(--brand-ink)' }}>
                        <Typography
                            fontSize={14}
                            fontWeight={'normal'}>
                            Delivery Fee:
                        </Typography>
                        <Typography
                            fontSize={14}
                            fontWeight={'normal'}
                            translate={'no'}>
                            {useStyledLocaleString(
                                getDeliveryFee(),
                                user?.geoInfo
                            )}
                        </Typography>
                    </Box>
                )}
                {siteData.vatEnabled && (
                    <Box
                        display={'flex'}
                        justifyContent={'space-between'}
                        sx={{ color: 'var(--brand-ink)' }}>
                        <Typography
                            fontSize={15}
                            fontWeight={'normal'}>
                            VAT
                            <span translate={'no'}>
                                (
                                {getSubtotal() === 0
                                    ? '0.00'
                                    : (
                                          (getVAT() / getSubtotal()) *
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
                            fontSize={14}
                            fontWeight={'normal'}
                            translate={'no'}>
                            {useStyledLocaleString(getVAT(), user?.geoInfo)}{' '}
                        </Typography>
                    </Box>
                )}
            </Box>
            <Divider sx={{ my: 0 }} />
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                gap={1.5}
                sx={{ px: 2, py: 1.25 }}>
                <Box>
                    <Typography
                        variant={'body2'}
                        fontWeight={'bold'}>
                        Total <span translate={'no'}>{getQuantity()}</span>{' '}
                        Products
                    </Typography>
                    <Typography
                        variant={'body2'}
                        fontWeight={'bold'}
                        fontSize={16}>
                        Total:{' '}
                        <span
                            style={{ fontSize: 20 }}
                            translate={'no'}>
                            {useStyledLocaleString(getTotal(), user?.geoInfo)}
                        </span>
                    </Typography>
                </Box>
                <Button
                    variant={'contained'}
                    sx={{
                        py: 1.1,
                        px: 2,
                        minWidth: 132,
                        whiteSpace: 'nowrap',
                        fontWeight: 'bold',
                        fontSize: 16,
                        color: '#fff',
                        transition: '0.6s',
                        boxShadow: 'none',
                        textTransform: 'capitalize'
                    }}
                    startIcon={
                        <CircularProgress
                            size={20}
                            sx={{
                                color: '#fff',
                                display: loading ? 'inline' : 'none'
                            }}
                        />
                    }
                    onClick={handleOnClick}
                    disabled={loading}>
                    <span style={{ display: loading ? 'inline' : 'none' }}>
                        Submitting...
                    </span>
                    <span style={{ display: loading ? 'none' : 'inline' }}>
                        View Order
                    </span>
                </Button>
            </Box>
            <ModalOrderCheckout
                open={openOrderCheckout.open}
                data={openOrderCheckout.data}
                setOpen={setOpenOrderCheckout}
            />
        </Box>
    );
};

export default ButtonPay;
