import { Box, Paper, Typography, Chip, Button, Divider } from '@mui/material';
import { useState } from 'react';
import api from '../../routes/api';
import ModalFlightPayment from './ModalFlightPayment';

export default function FlightCard({ booking }) {
    const [openPayment, setOpenPayment] = useState({
        open: false,
        data: null
    });

    const [gateway, setGateway] = useState([]);

    const handleOnPay = async () => {
        const res = await api.gateway.get({ payMethod: 'wise' });
        setGateway(res.data);
    };

    return (
        <Paper
            sx={{
                borderRadius: 3,
                p: 2,
                mb: 2,
                overflow: 'hidden'
            }}>
            {/* 🔝 状态 + 航司 */}
            <Box
                display='flex'
                justifyContent='space-between'
                mb={1}>
                <Typography fontWeight={600}>{booking.airlineName}</Typography>

                <Chip
                    label={booking.status}
                    size='small'
                    color={
                        booking.status === 'submitted'
                            ? 'warning'
                            : booking.status === 'confirmed'
                              ? 'success'
                              : 'default'
                    }
                />
            </Box>

            {/* ✈️ 航线 */}
            <Typography
                fontSize={18}
                fontWeight={700}>
                {booking.originCode} → {booking.destinationCode}
            </Typography>

            <Typography
                fontSize={13}
                color='text.secondary'
                mb={1}>
                {booking.originCity} → {booking.destinationCity}
            </Typography>

            <Divider sx={{ my: 1 }} />

            {/* 🕒 时间 */}
            <Typography fontSize={14}>
                Departure: {new Date(booking.departureAt).toLocaleString()}
            </Typography>

            {/* 👤 乘客 */}
            <Typography fontSize={14}>
                Passenger: {booking.passengerName}
            </Typography>

            {/* 💰 价格 + 操作 */}
            <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                mt={2}>
                <Typography
                    fontWeight={700}
                    color='primary.main'>
                    {booking.currency} {booking.price}
                </Typography>
                
                {booking.status === 'submitted' && (
                    <Button
                        size='small'
                        variant='contained'
                        onClick={() => {
                            // 判断是否已支付-未支付

                            if (booking.paymentLink)
                                // 是否有支付链接-是
                                window.open(booking.paymentLink);
                            else
                                // 是否有支付链接-否
                                setOpenPayment({ open: true, data: booking });

                            // 已支付 - 关闭按钮
                        }}>
                        Pay Ticket
                    </Button>
                )}
            </Box>
            <ModalFlightPayment
                open={openPayment.open}
                data={openPayment.data}
                setOpen={setOpenPayment}
            />
        </Paper>
    );
}
