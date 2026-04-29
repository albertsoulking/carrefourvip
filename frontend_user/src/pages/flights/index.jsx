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
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'var(--brand-cream)',
                pt: 3,
                pb: 11
            }}>
            <Container maxWidth={'lg'}>
                <Typography
                    variant='h4'
                    fontWeight={600}
                    sx={{
                        color: 'var(--brand-ink)',
                        fontFamily: 'var(--font-display)'
                    }}
                    gutterBottom>
                    Flight Booking
                </Typography>

                <Typography
                    variant='body2'
                    sx={{ color: 'var(--brand-muted)' }}
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
