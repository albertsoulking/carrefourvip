import { Box, Tabs, Tab, Pagination } from '@mui/material';
import { useState, useEffect } from 'react';
import OrderItem from './OrderItem';
import api from '../../routes/api';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import TopNavigator from '../layout/TopNavigator';
import web from '../../routes/web';

const OrderPage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useSmartNavigate();
    const [value, setValue] = useState(0);

    const tabs = [
        {
            key: undefined,
            value: 'All Orders'
        },
        {
            key: 'pending',
            value: 'Pending Payment'
        },
        {
            key: 'processing',
            value: 'Processing'
        },
        {
            key: 'shipped',
            value: 'On the Way'
        },
        {
            key: 'delivered',
            value: 'Delivered'
        },
        {
            key: 'cancelled',
            value: 'Cancelled'
        },
        {
            key: 'refunded',
            value: 'Refunded'
        }
    ];

    const [searchModal, setSearchModal] = useState({
        page: 1,
        limit: 6,
        orderBy: 'desc',
        sortBy: 'id'
    });
    const [orderData, setOrderData] = useState({
        data: [],
        total: 0,
        page: 1,
        lastPage: 0
    });

    useEffect(() => {
        if (!user) return;

        loadData(searchModal);
    }, [open]);

    const loadData = async (payload) => {
        setSearchModal(payload);

        const res = await api.orders.getMyOrders(payload);
        setOrderData(res.data);
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
        loadData({
            ...searchModal,
            status: tabs[newValue].key
        });
    };

    return (
        <Box
            sx={{
                pt: 8,
                pb: 4,
                minHeight: '100vh',
                position: 'relative',
                bgcolor: 'var(--brand-cream)'
            }}>
            <TopNavigator
                title={'My Orders'}
                backPath={web.profile}
                backText='Profile'
            />
            <Box sx={{ width: '100%' }}>
                <Box sx={{ px: 2 }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        aria-label={'Order Tabs'}
                        variant={'scrollable'}
                        scrollButtons='auto'
                        sx={{
                            minHeight: 'auto',
                            minWidth: 'auto',
                            bgcolor: 'rgba(255, 253, 250, 0.72)',
                            border: '1px solid var(--brand-line)',
                            borderRadius: '18px',
                            boxShadow: '0 10px 22px rgba(23, 57, 44, 0.06)'
                        }}
                        allowScrollButtonsMobile>
                        {tabs.map((tab, idx) => (
                            <Tab
                                key={idx}
                                label={tab.value}
                                sx={{
                                    minHeight: 'auto',
                                    minWidth: 'auto',
                                    overflow: 'auto',
                                    textTransform: 'capitalize'
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>
                <Box sx={{ p: 1.5 }}>
                    {orderData.data.map((order) => (
                        <OrderItem
                            key={order.id}
                            data={order}
                            user={user}
                            navigate={navigate}
                        />
                    ))}
                </Box>
            </Box>
            <Box
                my={2}
                display={'flex'}
                justifyContent={'center'}
                translate={'no'}>
                <Pagination
                    count={orderData.lastPage}
                    page={orderData.page}
                    onChange={(e, newPage) => {
                        loadData({
                            ...searchModal,
                            page: newPage
                        });
                    }}
                />
            </Box>
        </Box>
    );
};

export default OrderPage;
