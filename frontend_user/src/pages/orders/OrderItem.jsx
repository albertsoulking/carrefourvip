import {
    Card,
    CardContent,
    Typography,
    Box,
    CardActionArea
} from '@mui/material';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import web from '../../routes/web';

const OrderItem = ({ data, user, navigate }) => {
    // English status mapping
    const statusMap = {
        pending: 'Pending Payment',
        processing: 'Processing',
        shipped: 'On the Way',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        paid: 'Paid',
        refunded: 'Refunded'
    };

    // Status color mapping for English
    const statusColor = (status) => {
        switch (status) {
            case 'Delivered':
            case 'Paid':
                return { backgroundColor: '#C6F6D5', color: '#2F855A' }; // 绿色
            case 'Processing':
            case 'Pending Payment':
                return { backgroundColor: '#FEEBCB', color: '#DD6B20' }; // 橙色
            case 'Cancelled':
                return { backgroundColor: '#E2E8F0', color: '#A0AEC0' }; // 灰色
            case 'On the Way':
                return { backgroundColor: '#BEE3F8', color: '#3182CE' }; // 蓝色
            case 'Refunded':
                return { backgroundColor: '#E9D8FD', color: '#6B46C1' }; // 紫色
            default:
                return { backgroundColor: '#BEE3F8', color: '#3182CE' }; // 默认蓝
        }
    };

    const orderStatus = statusMap[data.status];
    const paymentStatus = statusMap[data.paymentStatus];

    return (
        <Card
            sx={{
                m: 1,
                borderRadius: 2,
                boxShadow: 'rgba(0, 0, 0, 0.1) 0 4px 12px'
            }}>
            <CardActionArea onClick={() => navigate(web.orderDetail(data.id))}>
                <CardContent sx={{ p: 1 }}>
                    <Box
                        display='flex'
                        justifyContent='space-between'
                        alignItems='center'>
                        <Typography
                            fontSize={14}
                            fontWeight={600}>
                            Order ID: #
                            <span
                                style={{
                                    display: data.id ? 'inline' : 'none'
                                }}>
                                {data.id}
                            </span>
                        </Typography>
                        <Box
                            display={'flex'}
                            justifyContent={'flex-end'}
                            alignItems={'flex-end'}
                            gap={0.5}>
                            <Typography
                                sx={{
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 2,
                                    fontSize: 10,
                                    fontWeight: 500,
                                    width: 'fit-content',
                                    ...statusColor(orderStatus)
                                }}>
                                <span
                                    style={{
                                        display: orderStatus ? 'inline' : 'none'
                                    }}>
                                    {orderStatus}
                                </span>
                            </Typography>
                            <Typography
                                sx={{
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 2,
                                    fontSize: 10,
                                    fontWeight: 500,
                                    width: 'fit-content',
                                    display:
                                        data.paymentStatus === 'pending' ||
                                        data.paymentStatus === 'cancelled' ||
                                        data.paymentStatus === 'refunded' ||
                                        data.status === 'delivered'
                                            ? 'none'
                                            : 'inline',
                                    ...statusColor(paymentStatus)
                                }}>
                                <span
                                    style={{
                                        display: paymentStatus
                                            ? 'inline'
                                            : 'none'
                                    }}>
                                    {paymentStatus}
                                </span>
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        display='flex'
                        gap={1}
                        alignItems='center'>
                        <Box
                            component='img'
                            src={`${
                                import.meta.env.VITE_API_BASE_URL
                            }/uploads/thumbs/${data.imageUrl}`}
                            alt={data.id}
                            sx={{
                                width: 50,
                                height: 50,
                                objectFit: 'cover',
                                borderRadius: 2
                            }}
                            translate={'no'}
                        />
                        <Box
                            display={'flex'}
                            flexDirection={'column'}
                            justifyContent={'flex-end'}>
                            <Typography
                                variant='body2'
                                color='text.primary'
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                <span
                                    style={{
                                        display: data.quantity
                                            ? 'inline'
                                            : 'none'
                                    }}>
                                    Total {data.quantity} Products
                                </span>
                            </Typography>
                            <Typography
                                fontSize='0.75rem'
                                color='text.disabled'
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                Time:{' '}
                                <span
                                    style={{
                                        display: data.createdAt
                                            ? 'inline'
                                            : 'none'
                                    }}>
                                    {new Date(data.createdAt).toLocaleString()}
                                </span>
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}></Box>
                        <Box
                            textAlign='right'
                            sx={{ textAlign: '-webkit-right' }}>
                            <Typography
                                fontSize={16}
                                fontWeight={700}
                                noWrap
                                translate={'no'}>
                                {useStyledLocaleString(
                                    data.payAmount,
                                    user?.geoInfo
                                )}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default OrderItem;
