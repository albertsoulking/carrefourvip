import { Box, Stack } from '@mui/material';
import TopNavigator from '../layout/TopNavigator';
import web from '../../routes/web';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import FlightCard from './FlightCard';

const FlightBookingPage = () => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const res = await api.flight.getAllBooking();
        setBookings(res.data);
    };

    return (
        <Box sx={{ pt: 10, px: 2, pb: 4 }}>
            <TopNavigator
                backPath={web.profile}
                backText={'Profile'}
                title={'Flight Booking'}
            />

            <Stack>
                {bookings.map((booking) => (
                    <FlightCard
                        key={booking.id}
                        booking={booking}
                    />
                ))}
            </Stack>
        </Box>
    );
};

export default FlightBookingPage;
