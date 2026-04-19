import React, { useState } from 'react';
import {
    Paper,
    Grid,
    Button,
    TextField,
    ToggleButtonGroup,
    ToggleButton,
    IconButton,
    MenuItem,
    Box,
    Typography
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import AirportAutocomplete from './AirportAutocomplete';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export default function FlightSearch({
    setFlights,
    setLoading,
    setSearchContext,
    loading
}) {
    const [tripType, setTripType] = useState('oneway');

    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);

    const [departDate, setDepartDate] = useState('');
    const [returnDate, setReturnDate] = useState('');

    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [cabin, setCabin] = useState('economy');
    const today = getTodayDate();

    const departureDateError =
        departDate && departDate < today
            ? 'Departure date cannot be in the past.'
            : '';

    const returnDateError =
        tripType === 'round' && returnDate
            ? returnDate < today
                ? 'Return date cannot be in the past.'
                : departDate && returnDate < departDate
                  ? 'Return date must be on or after departure date.'
                  : ''
            : '';

    const handleSwap = () => {
        setFrom(to);
        setTo(from);
    };

    const handleTripTypeChange = (event, value) => {
        if (!value) return;

        setTripType(value);

        if (value === 'oneway') {
            setReturnDate('');
        }
    };

    const handleDepartureDateChange = (event) => {
        const nextDepartureDate = event.target.value;

        setDepartDate(nextDepartureDate);

        if (returnDate && nextDepartureDate && returnDate < nextDepartureDate) {
            setReturnDate('');
        }
    };

    const handleReturnDateChange = (event) => {
        setReturnDate(event.target.value);
    };

    const searchFlights = async () => {
        if (!from || !to) {
            enqueueSnackbar(
                'Please select your departure point and destination!',
                {
                    variant: 'info'
                }
            );
            return;
        }

        if (from === to) {
            enqueueSnackbar(
                'Departure and destination cannot be the same!',
                {
                    variant: 'info'
                }
            );
            return;
        }

        if (!departDate) {
            enqueueSnackbar('Please select departure date!', {
                variant: 'info'
            });
            return;
        }

        if (departureDateError) {
            enqueueSnackbar(departureDateError, {
                variant: 'info'
            });
            return;
        }

        if (tripType === 'round' && !returnDate) {
            enqueueSnackbar('Please select return date!', {
                variant: 'info'
            });
            return;
        }

        if (returnDateError) {
            enqueueSnackbar(returnDateError, {
                variant: 'info'
            });
            return;
        }

        setLoading(true);

        const payload = {
            origin: from,
            destination: to,
            departureDate: departDate,
            adults,
            children,
            tripClass: cabin === 'business' ? 'C' : 'Y',
            oneWay: true
        };

        if (tripType === 'round') {
            payload.returnDate = returnDate;
            payload.oneWay = false;
        }

        setSearchContext({
            from,
            to,
            departDate,
            returnDate,
            adults,
            children,
            cabin,
            tripType
        });

        try {
            const res = await api.flight.search(payload);
            setFlights(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            setFlights([]);
            enqueueSnackbar(
                'Could not load flight deals right now. Please try again.',
                {
                    variant: 'error'
                }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper
            elevation={3}
            sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Box mb={2}>
                <ToggleButtonGroup
                    value={tripType}
                    exclusive
                    onChange={handleTripTypeChange}
                    color='primary'
                    size='small'>
                    <ToggleButton value='oneway'>One Way</ToggleButton>
                    <ToggleButton value='round'>Round Trip</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Grid
                container
                spacing={2}
                alignItems='center'>
                <Grid size={{ xs: 12, md: 5 }}>
                    <AirportAutocomplete
                        label='From'
                        value={from}
                        onChange={setFrom}
                    />
                </Grid>

                <Grid
                    size={{ xs: 12, md: 2 }}
                    textAlign='center'>
                    <IconButton onClick={handleSwap}>
                        <SwapHorizIcon />
                    </IconButton>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <AirportAutocomplete
                        label='To'
                        value={to}
                        onChange={setTo}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: tripType === 'round' ? 6 : 12 }}>
                    <TextField
                        type='date'
                        label='Departure'
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={departDate}
                        onChange={handleDepartureDateChange}
                        error={Boolean(departureDateError)}
                        helperText={departureDateError || ' '}
                        inputProps={{ min: today }}
                        size='small'
                    />
                </Grid>

                {tripType === 'round' && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            type='date'
                            label='Return'
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={returnDate}
                            onChange={handleReturnDateChange}
                            error={Boolean(returnDateError)}
                            helperText={
                                returnDateError ||
                                'Return date must be after departure.'
                            }
                            inputProps={{ min: departDate || today }}
                            disabled={!departDate}
                            size='small'
                        />
                    </Grid>
                )}
            </Grid>

            <Grid
                container
                spacing={2}
                mt={2}>
                <Grid size={{ xs: 3 }}>
                    <TextField
                        select
                        label='Adults'
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        fullWidth
                        size='small'>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <MenuItem
                                key={n}
                                value={n}>
                                {n}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid size={{ xs: 3 }}>
                    <TextField
                        select
                        label='Children'
                        value={children}
                        onChange={(e) => setChildren(Number(e.target.value))}
                        fullWidth
                        size='small'>
                        {[0, 1, 2, 3].map((n) => (
                            <MenuItem
                                key={n}
                                value={n}>
                                {n}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid size={{ xs: 6 }}>
                    <TextField
                        select
                        label='Cabin Class'
                        value={cabin}
                        onChange={(e) => setCabin(e.target.value)}
                        fullWidth
                        size='small'>
                        <MenuItem value='economy'>Economy</MenuItem>
                        <MenuItem value='premium'>Premium Economy</MenuItem>
                        <MenuItem value='business'>Business</MenuItem>
                        <MenuItem value='first'>First Class</MenuItem>
                    </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Button
                        fullWidth
                        variant='contained'
                        size='large'
                        startIcon={<SearchIcon />}
                        disabled={loading}
                        onClick={searchFlights}>
                        {loading ? 'Searching flights...' : 'Search flights'}
                    </Button>
                </Grid>
            </Grid>

            <Typography
                mt={2}
                variant='caption'
                color='text.secondary'>
                * Prices may change during booking
            </Typography>
        </Paper>
    );
}
