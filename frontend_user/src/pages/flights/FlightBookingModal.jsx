import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import api from '../../routes/api';

const TITLE_OPTIONS = ['Mr', 'Mrs', 'Ms', 'Miss', 'Master'];
const GENDER_OPTIONS = ['Male', 'Female'];
const DOCUMENT_TYPE_OPTIONS = [
    {
        label: 'Passport',
        value: 'passport'
    },
    {
        label: 'ID Card',
        value: 'id_card'
    }
];

function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function splitName(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return {
            firstName: '',
            lastName: ''
        };
    }

    if (parts.length === 1) {
        return {
            firstName: parts[0],
            lastName: ''
        };
    }

    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' ')
    };
}

function buildPassengerDrafts(adults, children, user) {
    const totalAdults = Number(adults) || 1;
    const totalChildren = Number(children) || 0;
    const nameParts = splitName(user?.name || '');
    const nationality = user?.country || '';

    const adultPassengers = Array.from({ length: totalAdults }, (_, index) => ({
        passengerType: 'adult',
        title: index === 0 ? 'Mr' : '',
        firstName: index === 0 ? nameParts.firstName : '',
        lastName: index === 0 ? nameParts.lastName : '',
        gender: '',
        dateOfBirth: '',
        nationality,
        documentType: 'passport',
        documentNumber: '',
        documentExpiry: ''
    }));

    const childPassengers = Array.from({ length: totalChildren }, () => ({
        passengerType: 'child',
        title: '',
        firstName: '',
        lastName: '',
        gender: '',
        dateOfBirth: '',
        nationality,
        documentType: 'passport',
        documentNumber: '',
        documentExpiry: ''
    }));

    return [...adultPassengers, ...childPassengers];
}

const FlightBookingModal = ({
    open,
    onClose,
    flight,
    searchContext,
    setOpenPayment
}) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const today = getTodayDate();
    const [contactForm, setContactForm] = useState({
        contactTitle: 'Mr',
        contactFirstName: '',
        contactLastName: '',
        contactEmail: '',
        contactPhone: '',
        specialRequests: ''
    });
    const [passengers, setPassengers] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const totalAdults = Number(searchContext?.adults) || 1;
    const totalChildren = Number(searchContext?.children) || 0;
    const passengerCount = totalAdults + totalChildren;

    useEffect(() => {
        if (!open || !flight) return;

        const nameParts = splitName(user?.name || '');
        setContactForm({
            contactTitle: 'Mr',
            contactFirstName: nameParts.firstName,
            contactLastName: nameParts.lastName,
            contactEmail: user?.email || '',
            contactPhone: user?.phone || '',
            specialRequests: ''
        });
        setPassengers(buildPassengerDrafts(totalAdults, totalChildren, user));
    }, [open, flight, totalAdults, totalChildren]);

    const tripTypeLabel = useMemo(
        () => (searchContext?.tripType === 'round' ? 'Round trip' : 'One way'),
        [searchContext?.tripType]
    );

    const cabinLabel = useMemo(() => {
        const mapping = {
            economy: 'Economy',
            premium: 'Premium Economy',
            business: 'Business',
            first: 'First Class'
        };

        return mapping[searchContext?.cabin] || 'Economy';
    }, [searchContext?.cabin]);

    const handleContactChange = (event) => {
        const { name, value } = event.target;

        setContactForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePassengerChange = (index, field, value) => {
        setPassengers((prev) =>
            prev.map((passenger, passengerIndex) =>
                passengerIndex === index
                    ? {
                          ...passenger,
                          [field]: value
                      }
                    : passenger
            )
        );
    };

    const validateForm = () => {
        if (!flight) {
            return 'Flight information is unavailable.';
        }

        const requiredContactFields = [
            ['contactFirstName', 'Please enter the contact first name.'],
            ['contactLastName', 'Please enter the contact last name.'],
            ['contactEmail', 'Please enter the contact email.'],
            ['contactPhone', 'Please enter the contact phone number.']
        ];

        for (const [field, message] of requiredContactFields) {
            if (!contactForm[field]?.trim()) {
                return message;
            }
        }

        for (let index = 0; index < passengers.length; index += 1) {
            const passenger = passengers[index];
            const label = `Passenger ${index + 1}`;

            if (!passenger.title) return `${label}: please select a title.`;
            if (!passenger.firstName?.trim()) {
                return `${label}: please enter the first name.`;
            }
            if (!passenger.lastName?.trim()) {
                return `${label}: please enter the last name.`;
            }
            if (!passenger.gender) return `${label}: please select a gender.`;
            if (!passenger.dateOfBirth) {
                return `${label}: please select the date of birth.`;
            }
            if (!passenger.nationality?.trim()) {
                return `${label}: please enter the nationality.`;
            }
            if (!passenger.documentNumber?.trim()) {
                return `${label}: please enter the document number.`;
            }
            if (!passenger.documentExpiry) {
                return `${label}: please select the document expiry date.`;
            }
            if (passenger.documentExpiry < today) {
                return `${label}: the document expiry date cannot be in the past.`;
            }
        }

        return null;
    };

    const handleSubmit = async () => {
        if (!user) {
            enqueueSnackbar('Please login before submitting a booking.', {
                variant: 'warning'
            });
            return;
        }

        const validationError = validateForm();
        if (validationError) {
            enqueueSnackbar(validationError, {
                variant: 'warning'
            });
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                airlineCode: flight.airlineCode,
                airlineName: flight.airlineName,
                originCode: flight.originCode,
                originCity: flight.originCity,
                originAirportName: flight.originAirportName,
                destinationCode: flight.destinationCode,
                destinationCity: flight.destinationCity,
                destinationAirportName: flight.destinationAirportName,
                departureAt: flight.departureAt,
                returnAt: flight.returnAt || null,
                tripType: searchContext?.tripType || 'oneway',
                cabinClass: searchContext?.cabin || 'economy',
                adults: totalAdults,
                children: totalChildren,
                price: Number(flight.price) || 0,
                currency: flight.currency || 'USD',
                providerLink: flight.providerLink || '',
                ...contactForm,
                passengers,
                flightSnapshot: {
                    tripType: searchContext?.tripType || 'oneway',
                    cabinClass: searchContext?.cabin || 'economy',
                    providerLink: flight.providerLink || '',
                    routeLabel: `${flight.originCode} - ${flight.destinationCode}`
                }
            };

            const res = await api.flight.createBooking(payload);

            enqueueSnackbar(
                `Booking submitted successfully (${res.data.bookingReference}).`,
                {
                    variant: 'success'
                }
            );
            onClose();
            setOpenPayment({
                open: true,
                data: {
                    ...res.data,
                    price: flight.price,
                    paymentLink: undefined
                }
            });
        } catch (error) {
            enqueueSnackbar(
                Array.isArray(error.response?.data?.message)
                    ? error.response.data.message[0]
                    : error.response?.data?.message || error.message,
                {
                    variant: 'error'
                }
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => {
                if (submitting) return;
                onClose();
            }}
            fullWidth
            maxWidth='lg'>
            <DialogTitle>Complete flight booking</DialogTitle>

            <DialogContent dividers>
                {flight && (
                    <Stack spacing={3}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: 'grey.50',
                                border: '1px solid',
                                borderColor: 'divider'
                            }}>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                justifyContent='space-between'
                                spacing={2}>
                                <Box>
                                    <Typography
                                        variant='h6'
                                        fontWeight={700}>
                                        {flight.airlineName} (
                                        {flight.airlineCode})
                                    </Typography>
                                    <Typography
                                        variant='body2'
                                        color='text.secondary'>
                                        {flight.originCode}
                                        {flight.originCity
                                            ? ` · ${flight.originCity}`
                                            : ''}{' '}
                                        to {flight.destinationCode}
                                        {flight.destinationCity
                                            ? ` · ${flight.destinationCity}`
                                            : ''}
                                    </Typography>
                                    <Typography
                                        variant='body2'
                                        color='text.secondary'>
                                        Departure: {flight.departureAt}
                                        {flight.returnAt
                                            ? ` | Return: ${flight.returnAt}`
                                            : ''}
                                    </Typography>
                                </Box>

                                <Stack
                                    direction='row'
                                    spacing={1}
                                    useFlexGap
                                    flexWrap='wrap'
                                    justifyContent='flex-start'>
                                    <Chip label={tripTypeLabel} />
                                    <Chip label={cabinLabel} />
                                    <Chip
                                        label={`${passengerCount} passenger${
                                            passengerCount > 1 ? 's' : ''
                                        }`}
                                    />
                                    <Chip
                                        color='primary'
                                        label={`USD ${Number(
                                            flight.price || 0
                                        ).toFixed(2)}`}
                                    />
                                </Stack>
                            </Stack>
                        </Box>

                        <Alert severity='info'>
                            Enter the lead contact and all passenger details as
                            they appear on travel documents.
                        </Alert>

                        <Box>
                            <Typography
                                variant='subtitle1'
                                fontWeight={700}
                                mb={2}>
                                Contact information
                            </Typography>
                            <Grid
                                container
                                spacing={2}>
                                <Grid size={{ xs: 12, md: 2 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        label='Title'
                                        name='contactTitle'
                                        value={contactForm.contactTitle}
                                        onChange={handleContactChange}>
                                        {TITLE_OPTIONS.map((item) => (
                                            <MenuItem
                                                key={item}
                                                value={item}>
                                                {item}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <TextField
                                        fullWidth
                                        label='First name'
                                        name='contactFirstName'
                                        value={contactForm.contactFirstName}
                                        onChange={handleContactChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <TextField
                                        fullWidth
                                        label='Last name'
                                        name='contactLastName'
                                        value={contactForm.contactLastName}
                                        onChange={handleContactChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label='Email'
                                        name='contactEmail'
                                        value={contactForm.contactEmail}
                                        onChange={handleContactChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label='Phone number'
                                        name='contactPhone'
                                        value={contactForm.contactPhone}
                                        onChange={handleContactChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        label='Special requests'
                                        name='specialRequests'
                                        value={contactForm.specialRequests}
                                        onChange={handleContactChange}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider />

                        <Stack spacing={2}>
                            <Typography
                                variant='subtitle1'
                                fontWeight={700}>
                                Passenger information
                            </Typography>

                            {passengers.map((passenger, index) => (
                                <Box
                                    key={`${passenger.passengerType}-${index}`}
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}>
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        justifyContent='space-between'
                                        alignItems={{
                                            xs: 'flex-start',
                                            sm: 'center'
                                        }}
                                        mb={2}>
                                        <Typography
                                            variant='subtitle2'
                                            fontWeight={700}>
                                            Passenger {index + 1}
                                        </Typography>
                                        <Chip
                                            size='small'
                                            color={
                                                passenger.passengerType ===
                                                'adult'
                                                    ? 'primary'
                                                    : 'warning'
                                            }
                                            label={passenger.passengerType}
                                        />
                                    </Stack>

                                    <Grid
                                        container
                                        spacing={2}>
                                        <Grid size={{ xs: 12, md: 2 }}>
                                            <TextField
                                                select
                                                fullWidth
                                                label='Title'
                                                value={passenger.title}
                                                onChange={(event) =>
                                                    handlePassengerChange(
                                                        index,
                                                        'title',
                                                        event.target.value
                                                    )
                                                }>
                                                {TITLE_OPTIONS.map((item) => (
                                                    <MenuItem
                                                        key={item}
                                                        value={item}>
                                                        {item}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 5 }}>
                                            <TextField
                                                fullWidth
                                                label='First name'
                                                value={passenger.firstName}
                                                onChange={(event) =>
                                                    handlePassengerChange(
                                                        index,
                                                        'firstName',
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 5 }}>
                                            <TextField
                                                fullWidth
                                                label='Last name'
                                                value={passenger.lastName}
                                                onChange={(event) =>
                                                    handlePassengerChange(
                                                        index,
                                                        'lastName',
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <TextField
                                                select
                                                fullWidth
                                                label='Gender'
                                                value={passenger.gender}
                                                onChange={(event) =>
                                                    handlePassengerChange(
                                                        index,
                                                        'gender',
                                                        event.target.value
                                                    )
                                                }>
                                                {GENDER_OPTIONS.map((item) => (
                                                    <MenuItem
                                                        key={item}
                                                        value={item}>
                                                        {item}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <TextField
                                                type='date'
                                                fullWidth
                                                label='Date of birth'
                                                value={passenger.dateOfBirth}
                                                onChange={(event) =>
                                                    handlePassengerChange(
                                                        index,
                                                        'dateOfBirth',
                                                        event.target.value
                                                    )
                                                }
                                                InputLabelProps={{
                                                    shrink: true
                                                }}
                                                inputProps={{ max: today }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <TextField
                                                fullWidth
                                                label='Nationality'
                                                value={passenger.nationality}
                                                onChange={(event) =>
                                                    handlePassengerChange(
                                                        index,
                                                        'nationality',
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <TextField
                                                select
                                                fullWidth
                                                label='Document type'
                                                value={passenger.documentType}
                                                onChange={(event) =>
                                                    handlePassengerChange(
                                                        index,
                                                        'documentType',
                                                        event.target.value
                                                    )
                                                }>
                                                {DOCUMENT_TYPE_OPTIONS.map(
                                                    (item) => (
                                                        <MenuItem
                                                            key={item.value}
                                                            value={item.value}>
                                                            {item.label}
                                                        </MenuItem>
                                                    )
                                                )}
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                fullWidth
                                                label='Document number'
                                                value={passenger.documentNumber}
                                                onChange={(event) =>
                                                    handlePassengerChange(
                                                        index,
                                                        'documentNumber',
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                type='date'
                                                fullWidth
                                                label='Document expiry'
                                                value={passenger.documentExpiry}
                                                onChange={(event) =>
                                                    handlePassengerChange(
                                                        index,
                                                        'documentExpiry',
                                                        event.target.value
                                                    )
                                                }
                                                InputLabelProps={{
                                                    shrink: true
                                                }}
                                                inputProps={{ min: today }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                        </Stack>
                    </Stack>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    color='inherit'
                    disabled={submitting}
                    onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    disabled={submitting || !flight}
                    onClick={handleSubmit}>
                    {submitting ? 'Submitting...' : 'Submit order'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FlightBookingModal;
