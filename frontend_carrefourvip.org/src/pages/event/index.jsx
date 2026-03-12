import { Box, Typography, Button } from '@mui/material';
import { useEffect } from 'react';
import api from '../../routes/api';
import { useState } from 'react';
import EventItem from './EventItem';
import web from '../../routes/web';
import { ArrowBackIosNewRounded } from '@mui/icons-material';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

const EventPage = () => {
    const navigate = useSmartNavigate();
    const [eventData, setEventData] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const res = await api.event.getAll();
        setEventData(res.data);
    };

    return (
        <Box sx={{ py: 4, height: '70vh' }}>
            <Button
                size={'small'}
                startIcon={<ArrowBackIosNewRounded fontSize={'small'} />}
                sx={{ position: 'absolute' }}
                onClick={() => navigate(web.profile)}>
                Back
            </Button>
            <Typography
                fontWeight={'bold'}
                textAlign={'center'}>
                Event Zone
            </Typography>
            {eventData.map((event) => (
                <EventItem
                    key={event.id}
                    data={event}
                    onClick={() => navigate(web.eventDetail(event.id))}
                />
            ))}
        </Box>
    );
};

export default EventPage;
