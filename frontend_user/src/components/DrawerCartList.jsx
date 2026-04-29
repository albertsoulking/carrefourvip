import { CloseRounded, ShoppingCartRounded } from '@mui/icons-material';
import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import AddressItem from './AddressItem';
import CartEmpty from '../pages/product/CartEmpty';
import CartHasItem from '../pages/product/CartHasItem';
import ButtonPay from './ButtonPay';
import { useEffect, useState } from 'react';
import DeliveryItem from './DeliveryItem';
import api from '../routes/api';

export default function DrawerCartList({
    open,
    setOpen
}) {
    const user = JSON.parse(localStorage.getItem('user'));
    const [userSelectedManually, setUserSelectedManually] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [shippingFee, setShippingFee] = useState({
        fees: 0,
        type: 'standard',
        rule: {}
    });
    const [cartData, setCartData] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [deliveryData, setDeliveryData] = useState({});
    const [siteData, setSiteData] = useState({});

    useEffect(() => {
        if (!open) return;

        loadCartData();
        loadDeliverySettings();
        loadSiteSettings();
    }, [open]);

    const loadCartData = async () => {
        if (!user) return;

        const res = await api.carts.getAll();
        setCartData(res.data);
        setSelectedIds(res.data.map((item) => item.id));
    };

    const loadDeliverySettings = async () => {
        const payload = {
            group: 'setting',
            key: 'delivery'
        };

        const res = await api.settings.get(payload);
        setDeliveryData(res.data);
    };

    const loadSiteSettings = async () => {
        const payload = {
            group: 'setting',
            key: 'website'
        }

        const res = await api.settings.get(payload);
        setSiteData(res.data);
    };

    useEffect(() => {
        calculateShippingFee();
    }, [shippingFee.type, deliveryData, selectedIds]);

    const calculateShippingFee = () => {
        const isEmpty = (obj) => obj && Object.entries(obj).length === 0;
        if (isEmpty(deliveryData)) return;
        
        const deliveryRules = normalizeArray(deliveryData.deliveryRules);
        if (deliveryRules.length === 0) return;
        
        const rule = deliveryRules.find(r => r.code === shippingFee.type);

        const subtotal = cartData
            .filter((item) => selectedIds.includes(item.id))
            .reduce(
                (sum, curr) => sum + curr.quantity * Number(curr.product.price),
                0
            );

        const expressMin = deliveryRules.find(r => r.code === 'express');
        
        let fees = 0;
        let type = subtotal >= expressMin.minStandard ? 'express' : 'standard';
        
        if (subtotal >= Number(rule.minStandard) && subtotal < Number(rule.maxStandard) + 1) {
            fees = Number(rule.feeStandard);
        } else if (subtotal >= Number(rule.minAdvanced) && subtotal < Number(rule.maxAdvanced) + 1) {
            fees = Number(rule.feeAdvanced);
        } else if (subtotal >= Number(rule.minFree)) {
            fees = Number(rule.feeFree);
        }

        setShippingFee((prev) => ({
            fees,
            type:
                userSelectedManually && type !== 'standard' ? prev.type : type,
            rule
        }));
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

    return (
        <Drawer
            anchor={'right'}
            open={open}
            sx={{ '.MuiCard-root': { overflow: 'auto' } }}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 420 },
                    maxWidth: '100vw',
                    bgcolor: 'var(--brand-cream)',
                    borderLeft: '1px solid var(--brand-line)'
                }
            }}
            onClose={() => setOpen(false)}
            keepMounted>
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                    bgcolor: 'var(--brand-nav)',
                    borderBottom: '1px solid var(--brand-line)',
                    backdropFilter: 'blur(var(--brand-blur))'
                }}>
                <Stack
                    direction={'row'}
                    spacing={1}
                    alignItems={'center'}>
                    <Box
                        sx={{
                            width: 38,
                            height: 38,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 'var(--brand-radius-md)',
                            bgcolor: 'var(--brand-forest)',
                            color: '#fff'
                        }}>
                        <ShoppingCartRounded fontSize={'small'} />
                    </Box>
                    <Box>
                        <Typography
                            fontSize={18}
                            fontWeight={800}
                            color={'var(--brand-ink)'}>
                            Shopping Cart
                        </Typography>
                        <Typography
                            fontSize={12}
                            color={'var(--brand-muted)'}
                            translate={'no'}>
                            {selectedIds.length}/{cartData.length} selected
                        </Typography>
                    </Box>
                </Stack>
                <IconButton
                    sx={{
                        border: '1px solid var(--brand-line)',
                        bgcolor: 'var(--brand-paper)'
                    }}
                    onClick={() => setOpen(false)}>
                    <CloseRounded />
                </IconButton>
            </Box>
            <Box
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    px: 1.25,
                    pt: 1.25,
                    pb: 1
                }}>
            {siteData.deliveryAddressEnabled && (
                <AddressItem
                    selectedAddress={selectedAddress}
                    setSelectedAddress={setSelectedAddress}
                />
            )}
            {siteData.deliveryFeeEnabled && (
                <DeliveryItem
                    data={cartData}
                    selectedIds={selectedIds}
                    shippingFee={shippingFee}
                    setShippingFee={setShippingFee}
                    setUserSelectedManually={setUserSelectedManually}
                    deliveryData={deliveryData}
                />
            )}
            {cartData.length === 0 ? (
                <CartEmpty
                    data={cartData}
                />
            ) : (
                <CartHasItem
                    data={cartData}
                    setOpen={setOpen}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    loadCartData={loadCartData}
                />
            )}
            </Box>
            <ButtonPay
                data={cartData}
                selectedIds={selectedIds}
                selectedAddress={selectedAddress}
                setOpenCart={setOpen}
                shippingFee={shippingFee}
                siteData={siteData}
                deliveryData={deliveryData}
            />
            </Box>
        </Drawer>
    );
}
