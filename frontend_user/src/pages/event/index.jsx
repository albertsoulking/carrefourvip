import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import api from '../../routes/api';
import { useState } from 'react';
import EventItem from './EventItem';
import web from '../../routes/web';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import TopNavigator from '../layout/TopNavigator';

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
        <Box
            sx={{
                pt: 'var(--app-top-bar-space)',
                pb: 4,
                minHeight: '100vh',
                bgcolor: 'var(--brand-cream)'
            }}>
            <TopNavigator
                title={'Event Zone'}
                backText={'Profile'}
                backPath={web.profile}
            />
            <Typography
                fontWeight={'bold'}
                textAlign={'center'}
                sx={{
                    mb: 2,
                    color: 'var(--brand-ink)',
                    fontFamily: 'var(--font-display)',
                    fontSize: 24
                }}>
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
