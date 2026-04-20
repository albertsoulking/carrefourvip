import { useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Skeleton,
    Stack,
    Typography
} from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ConnectingAirportsIcon from '@mui/icons-material/ConnectingAirports';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import airlinesData from '../../data/airlines.json';
import airportsData from '../../data/airports.json';
import FlightBookingModal from './FlightBookingModal';
import ModalFlightPayment from '../flights_booking/ModalFlightPayment';

const airportsByIata = Object.values(airportsData || {}).reduce(
    (lookup, airport) => {
        if (airport?.iata) {
            lookup[airport.iata] = airport;
        }

        return lookup;
    },
    {}
);

const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
});

function toDate(value) {
    if (!value) return null;

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTime(value) {
    if (!value) return 'Time TBA';
    if (typeof value === 'string' && /^\d{1,2}:\d{2}/.test(value)) {
        return value;
    }

    const date = toDate(value);
    if (!date) return 'Time TBA';

    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDay(value) {
    const date = toDate(value);
    if (!date) return 'Date TBA';

    return date.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function formatPrice(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return 'Price TBA';

    return priceFormatter.format(amount);
}

function getPriceValue(value) {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : Number.POSITIVE_INFINITY;
}

function getAirportDetails(code) {
    const airport = airportsByIata[code];

    return {
        code: code || '---',
        city: airport?.city || airport?.name || 'Airport unavailable',
        airportName: airport?.name || '',
        country: airport?.country || ''
    };
}

function getAirlineName(code) {
    if (!code) return 'Partner airline';

    return airlinesData[code] || `Airline ${code}`;
}

function getAirlineLogoUrl(code) {
    if (!code) return undefined;

    return `https://pics.avs.io/200/200/${code}.png`;
}

function buildDealUrl(link) {
    if (!link) return null;
    if (/^https?:\/\//.test(link)) return link;

    return `https://www.aviasales.com${link}`;
}

function getDepartureTimestamp(value) {
    const date = toDate(value);
    return date ? date.getTime() : Number.POSITIVE_INFINITY;
}

function getBadges(flight, cheapestFlight, earliestFlight) {
    const badges = [];

    if (flight.id && cheapestFlight?.id === flight.id) {
        badges.push({ label: 'Cheapest', color: 'success', variant: 'filled' });
    }

    if (flight.id && earliestFlight?.id === flight.id) {
        badges.push({ label: 'Earliest', color: 'info', variant: 'filled' });
    }

    badges.push({
        label: flight.return ? 'Round trip' : 'One way',
        color: 'default',
        variant: 'outlined'
    });

    if (flight.stops) {
        badges.push({
            label: flight.stops,
            color: 'default',
            variant: 'outlined'
        });
    }

    return badges;
}

function SummaryCard({ icon, title, value, caption }) {
    return (
        <Card
            variant='outlined'
            sx={{
                borderRadius: 3,
                borderColor: 'divider',
                bgcolor: 'background.paper'
            }}>
            <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1.25}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2.5,
                            bgcolor: 'action.hover',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                        {icon}
                    </Box>

                    <Typography
                        variant='body2'
                        color='text.secondary'>
                        {title}
                    </Typography>

                    <Typography
                        variant='h5'
                        fontWeight={700}>
                        {value}
                    </Typography>

                    <Typography
                        variant='caption'
                        color='text.secondary'>
                        {caption}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}

function DetailPill({ icon, label, value }) {
    return (
        <Box
            sx={{
                px: 1.5,
                py: 1.25,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'grey.50'
            }}>
            <Stack
                direction='row'
                spacing={1}
                alignItems='center'>
                {icon}

                <Box minWidth={0}>
                    <Typography
                        variant='caption'
                        color='text.secondary'
                        display='block'>
                        {label}
                    </Typography>
                    <Typography
                        variant='body2'
                        fontWeight={600}>
                        {value}
                    </Typography>
                </Box>
            </Stack>
        </Box>
    );
}

export default function FlightResults({
    loading,
    flights = [],
    searchContext
}) {
    const [bookingModal, setBookingModal] = useState({
        open: false,
        flight: null
    });
    const [openPayment, setOpenPayment] = useState({
        open: false,
        flight: null
    });

    if (loading) {
        return (
            <Stack
                spacing={2.5}
                sx={{ mt: 3 }}>
                {[1, 2, 3].map((item) => (
                    <Skeleton
                        key={item}
                        variant='rounded'
                        height={220}
                    />
                ))}
            </Stack>
        );
    }

    if (!flights.length) {
        return (
            <Card
                variant='outlined'
                sx={{
                    mt: 3,
                    borderRadius: 4,
                    borderStyle: 'dashed',
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                }}>
                <CardContent sx={{ py: 5 }}>
                    <Stack
                        spacing={1.5}
                        alignItems='center'
                        textAlign='center'>
                        <FlightTakeoffIcon
                            color='primary'
                            sx={{ fontSize: 40 }}
                        />

                        <Typography
                            variant='h6'
                            fontWeight={700}>
                            Flight deals will appear here
                        </Typography>

                        <Typography
                            color='text.secondary'
                            maxWidth={520}>
                            Choose your route, travel date, and passengers to
                            compare fares in one place.
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    const rankedFlights = [...flights].sort(
        (left, right) => getPriceValue(left.price) - getPriceValue(right.price)
    );
    const cheapestFlight = rankedFlights[0];
    const earliestFlight = [...flights].sort(
        (left, right) =>
            getDepartureTimestamp(left.departure) -
            getDepartureTimestamp(right.departure)
    )[0];
    const airlineCount = new Set(
        flights.map((flight) => flight.airlineCode).filter(Boolean)
    ).size;
    const routeLabel = rankedFlights[0]
        ? `${rankedFlights[0].from} to ${rankedFlights[0].to}`
        : 'your selected route';
    const cheapestAirlineName = getAirlineName(cheapestFlight?.airlineCode);

    return (
        <Stack
            spacing={3}
            sx={{ mt: 3, pb: 2 }}>
            <Box>
                <Typography
                    variant='h5'
                    fontWeight={700}>
                    Available flight deals
                </Typography>
                <Typography
                    variant='body2'
                    color='text.secondary'>
                    {rankedFlights.length} options for {routeLabel}. Open a
                    deal to confirm the latest fare on the partner site.
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(3, minmax(0, 1fr))'
                    }
                }}>
                <SummaryCard
                    icon={<SellOutlinedIcon color='success' />}
                    title='Lowest fare'
                    value={formatPrice(cheapestFlight?.price)}
                    caption={
                        cheapestFlight?.airlineCode
                            ? `${cheapestAirlineName} currently has the lowest listed fare.`
                            : 'Pricing updates after every search.'
                    }
                />
                <SummaryCard
                    icon={<FlightTakeoffIcon color='primary' />}
                    title='Earliest departure'
                    value={formatTime(earliestFlight?.departure)}
                    caption={formatDay(earliestFlight?.departure)}
                />
                <SummaryCard
                    icon={<ConnectingAirportsIcon color='warning' />}
                    title='Airlines found'
                    value={String(airlineCount)}
                    caption={`Showing partner fares across ${airlineCount} airline${
                        airlineCount === 1 ? '' : 's'
                    }.`}
                />
            </Box>

            <Stack spacing={2}>
                {rankedFlights.map((flight, index) => {
                    const origin = getAirportDetails(flight.from);
                    const destination = getAirportDetails(flight.to);
                    const airlineCode = flight.airlineCode || '';
                    const airlineName = getAirlineName(airlineCode);
                    const logoUrl = getAirlineLogoUrl(airlineCode);
                    const badges = getBadges(
                        flight,
                        cheapestFlight,
                        earliestFlight
                    );
                    const dealUrl = buildDealUrl(flight.id);

                    return (
                        <Card
                            key={flight.id || `${airlineCode}-${index}`}
                            sx={{
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
                                transition: '0.2s ease',
                                '&:hover': {
                                    boxShadow:
                                        '0 24px 55px rgba(15, 23, 42, 0.14)',
                                    transform: 'translateY(-2px)'
                                }
                            }}>
                            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                                <Stack spacing={2.5}>
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        justifyContent='space-between'
                                        spacing={2}>
                                        <Stack
                                            direction='row'
                                            spacing={2}
                                            alignItems='center'>
                                            <Avatar
                                                src={logoUrl}
                                                alt={airlineName}
                                                variant='rounded'
                                                sx={{
                                                    width: 52,
                                                    height: 52,
                                                    bgcolor: 'grey.100',
                                                    color: 'text.primary',
                                                    fontWeight: 700
                                                }}>
                                                {airlineCode ||
                                                    airlineName
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                            </Avatar>

                                            <Box>
                                                <Typography
                                                    variant='h6'
                                                    fontWeight={700}>
                                                    {airlineName}
                                                </Typography>
                                                <Typography
                                                    variant='body2'
                                                    color='text.secondary'>
                                                    {airlineCode ||
                                                        'Partner fare'}{' '}
                                                    on {routeLabel}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack
                                            direction='row'
                                            spacing={1}
                                            useFlexGap
                                            flexWrap='wrap'
                                            justifyContent={{
                                                xs: 'flex-start',
                                                sm: 'flex-end'
                                            }}>
                                            {badges.map((badge) => (
                                                <Chip
                                                    key={`${flight.id}-${badge.label}`}
                                                    label={badge.label}
                                                    color={badge.color}
                                                    variant={badge.variant}
                                                />
                                            ))}
                                        </Stack>
                                    </Stack>

                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gap: 2,
                                            alignItems: 'center',
                                            gridTemplateColumns: {
                                                xs: '1fr',
                                                md: 'minmax(0, 1fr) auto minmax(0, 1fr)'
                                            }
                                        }}>
                                        <Box>
                                            <Typography
                                                variant='overline'
                                                color='text.secondary'>
                                                From
                                            </Typography>
                                            <Typography
                                                variant='h4'
                                                fontWeight={800}>
                                                {origin.code}
                                            </Typography>
                                            <Typography fontWeight={600}>
                                                {origin.city}
                                            </Typography>
                                            <Typography
                                                variant='body2'
                                                color='text.secondary'>
                                                {origin.airportName ||
                                                    origin.country}
                                            </Typography>
                                        </Box>

                                        <Stack
                                            spacing={0.75}
                                            alignItems='center'
                                            sx={{ color: 'text.secondary' }}>
                                            <Box
                                                sx={{
                                                    width: {
                                                        xs: '100%',
                                                        md: 160
                                                    },
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}>
                                                <Divider sx={{ flex: 1 }} />
                                                <FlightTakeoffIcon fontSize='small' />
                                                <Divider sx={{ flex: 1 }} />
                                            </Box>

                                            <Typography
                                                variant='body2'
                                                fontWeight={600}>
                                                {formatDay(flight.departure)}
                                            </Typography>
                                            <Typography variant='caption'>
                                                {formatTime(flight.departure)}
                                            </Typography>
                                        </Stack>

                                        <Box
                                            textAlign={{
                                                xs: 'left',
                                                md: 'right'
                                            }}>
                                            <Typography
                                                variant='overline'
                                                color='text.secondary'>
                                                To
                                            </Typography>
                                            <Typography
                                                variant='h4'
                                                fontWeight={800}>
                                                {destination.code}
                                            </Typography>
                                            <Typography fontWeight={600}>
                                                {destination.city}
                                            </Typography>
                                            <Typography
                                                variant='body2'
                                                color='text.secondary'>
                                                {destination.airportName ||
                                                    destination.country}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 1
                                        }}>
                                        <DetailPill
                                            icon={
                                                <CalendarMonthOutlinedIcon
                                                    fontSize='small'
                                                    color='action'
                                                />
                                            }
                                            label='Departure'
                                            value={`${formatDay(
                                                flight.departure
                                            )} · ${formatTime(flight.departure)}`}
                                        />

                                        {flight.return && (
                                            <DetailPill
                                                icon={
                                                    <CalendarMonthOutlinedIcon
                                                        fontSize='small'
                                                        color='action'
                                                    />
                                                }
                                                label='Return'
                                                value={`${formatDay(
                                                    flight.return
                                                )} · ${formatTime(flight.return)}`}
                                            />
                                        )}

                                        {flight.duration && (
                                            <DetailPill
                                                icon={
                                                    <ConnectingAirportsIcon
                                                        fontSize='small'
                                                        color='action'
                                                    />
                                                }
                                                label='Travel time'
                                                value={flight.duration}
                                            />
                                        )}

                                        <Box flexGrow={1} />
                                        <Box textAlign='right'>
                                            <Typography
                                                variant='h4'
                                                fontWeight={800}>
                                                {formatPrice(flight.price)}
                                            </Typography>
                                            <Typography
                                                variant='caption'
                                                color='text.secondary'>
                                                Latest listed fare
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider />

                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        justifyContent='space-between'
                                        alignItems={{
                                            xs: 'flex-start',
                                            sm: 'center'
                                        }}
                                        spacing={2}>
                                        <Typography
                                            variant='body2'
                                            color='text.secondary'>
                                            Final price and schedule are
                                            confirmed on the partner site before
                                            checkout.
                                        </Typography>

                                        <Stack
                                            direction={{ xs: 'column', sm: 'row' }}
                                            alignItems={{
                                                xs: 'flex-start',
                                                sm: 'center'
                                            }}
                                            spacing={1.5}>
                                            <Button
                                                variant='contained'
                                                size='large'
                                                endIcon={<OpenInNewIcon />}
                                                disabled={!dealUrl}
                                                sx={{ whiteSpace: 'nowrap' }}
                                                onClick={() => {
                                                    //   if (!dealUrl) return;
                                                    //   window.open(dealUrl, "_blank", "noopener,noreferrer");
                                                    setBookingModal({
                                                        open: true,
                                                        flight: {
                                                            airlineCode,
                                                            airlineName,
                                                            originCode:
                                                                origin.code,
                                                            originCity:
                                                                origin.city,
                                                            originAirportName:
                                                                origin.airportName,
                                                            destinationCode:
                                                                destination.code,
                                                            destinationCity:
                                                                destination.city,
                                                            destinationAirportName:
                                                                destination.airportName,
                                                            departureAt:
                                                                flight.departure,
                                                            returnAt:
                                                                flight.return ||
                                                                searchContext?.returnDate ||
                                                                null,
                                                            price: flight.price,
                                                            currency: 'USD',
                                                            providerLink:
                                                                dealUrl
                                                        }
                                                    });
                                                }}>
                                                View deal
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>

            <FlightBookingModal
                open={bookingModal.open}
                flight={bookingModal.flight}
                searchContext={searchContext}
                onClose={() =>
                    setBookingModal({
                        open: false,
                        flight: null
                    })
                }
                setOpenPayment={setOpenPayment}
            />
            <ModalFlightPayment
                open={openPayment.open}
                data={openPayment.data}
                setOpen={setOpenPayment} />
        </Stack>
    );
}
