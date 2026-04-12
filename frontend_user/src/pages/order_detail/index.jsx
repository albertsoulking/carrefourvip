import { Box, Typography, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import { useParams } from 'react-router-dom';
import StatusItem from './StatusItem';
import AddressItem from './AddressItem';
import DeliveryItem from './DeliveryItem';
import OrderItem from './OrderItem';
import PaymentItem from './PaymentItem';
import CustomerItem from './CustomerItem';
import ActionBar from './ActionBar';
import DetailItem from './DetailItem';
import RatingItem from './RatingItem';
import web from '../../routes/web';
import TopNavigator from '../layout/TopNavigator';
import ModalPaymentCheckout from '../../components/ModalPaymentCheckout';
import { useTranslation } from 'react-i18next';

const OrderDetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [openPayment, setOpenPayment] = useState({
        open: false,
        data: null
    });
    const [gateway, setGateway] = useState([]);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        const res = await api.orders.getOne({ id });
        setOrder(res.data === '' ? null : res.data);

        const resGate = await api.gateway.get({ payMethod: res.data.payMethod });
        setGateway(resGate.data);
    };

    return (
        <Box mt={8}>
            <TopNavigator
                backText={t('orderDetail.backText')}
                backPath={web.order}
                title={t('orderDetail.detail.title')}
            />
            {order ? (
                <Box sx={{ p: 2 }}>
                    <StatusItem {...order} />
                    <DeliveryItem
                        {...order}
                        loadData={loadData}
                    />
                    <Divider sx={{ mb: 1 }} />
                    <DetailItem {...order} />
                    <Divider sx={{ mb: 1 }} />
                    <AddressItem {...order} />
                    <Divider sx={{ mb: 1 }} />
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant={'body1'}
                            fontWeight={'bold'}
                            mb={2}>
                            {t('orderDetail.productTitle')}
                        </Typography>
                        {order &&
                            order.items.map((item) => (
                                <OrderItem
                                    key={item.id}
                                    data={item}
                                />
                            ))}
                    </Box>
                    <Divider sx={{ mb: 1 }} />
                    <PaymentItem
                        subtotal={order?.subtotal ?? 0}
                        deliveryFee={order?.deliveryFee ?? 0}
                        total={order?.totalPrice ?? 0}
                        payAmount={order?.payAmount ?? 0}
                        discount={
                            order
                                ? Number(order.balanceDeduct) +
                                  Number(order.discountPayPal)
                                : 0
                        }
                        vat={order?.vat ?? 0}
                    />
                    <Divider sx={{ mb: 1 }} />
                    <CustomerItem />
                    <RatingItem />
                    <ActionBar
                        {...order}
                        loadData={loadData}
                        setOpenPayment={setOpenPayment}
                        data={order}
                    />
                </Box>
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
                        {t('orderDetail.noOrder')}
                    </Typography>
                </Box>
            )}
            {/** Order Payment Checkout Dialog */}
            <ModalPaymentCheckout
                open={openPayment.open}
                data={openPayment.data}
                setOpen={setOpenPayment}
                paymentType={order?.payMethod}
                gateway={gateway}
            />
        </Box>
    );
};

export default OrderDetailPage;
