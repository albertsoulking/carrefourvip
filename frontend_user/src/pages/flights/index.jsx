import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import FlightSearch from './FlightSearch';
import TopNavigator from '../layout/TopNavigator';
import web from '../../routes/web';
import FlightResults from './FlightResults';
import BottomNavigator from '../layout/BottomNavigator';
import ModalFlightPayment from '../flights_booking/ModalFlightPayment';

export default function FlightPage() {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchContext, setSearchContext] = useState(null);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', pt:2, pb: 6 }}>
            <Container maxWidth={'lg'}>
                <Typography
                    variant='h4'
                    fontWeight={600}
                    gutterBottom>
                    Flight Booking
                </Typography>

                <Typography
                    variant='body2'
                    color='text.secondary'
                    mb={3}>
                    Search and compare flights. Prices may change during
                    booking.
                </Typography>

                <FlightSearch
                    setFlights={setFlights}
                    setLoading={setLoading}
                    setSearchContext={setSearchContext}
                    loading={loading}
                />
                <FlightResults
                    loading={loading}
                    flights={flights}
                    searchContext={searchContext}
                />
            </Container>
            <BottomNavigator />
        </Box>
    );
}
