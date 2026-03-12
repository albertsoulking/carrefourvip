import { Box, Typography, Button } from '@mui/material';
import { ArrowBackIosNewRounded } from '@mui/icons-material';
import LuckyWheelCanvas from './LuckyWheelCanvas';
import { useEffect } from 'react';
import api from '../../routes/api';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import web from '../../routes/web';
import ModalResultDetail from './ModalResultDetail';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

const EventDetailPage = () => {
    const { id } = useParams();
    const navigate = useSmartNavigate();
    const [eventData, setEventData] = useState({});
    const [openWheelResult, setOpenWheelResult] = useState({
        open: false,
        data: null
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const res = await api.event.get({ id });
        setEventData(res.data);
    };

    return (
        <Box sx={{ py: 4, height: '70vh' }}>
            <Button
                size={'small'}
                startIcon={<ArrowBackIosNewRounded fontSize={'small'} />}
                sx={{ position: 'absolute' }}
                onClick={() => navigate(web.event)}>
                Back
            </Button>
            <Typography
                fontWeight={'bold'}
                textAlign={'center'}>
                {eventData.name}
            </Typography>
            <LuckyWheelCanvas
                id={eventData?.id}
                prizes={JSON.parse(eventData?.luckyWheel?.prizes || '[]')}
                setOpen={setOpenWheelResult}
            />
            <ModalResultDetail
                open={openWheelResult.open}
                data={openWheelResult.data}
                setOpen={setOpenWheelResult}
                eventId={id}
            />
        </Box>
    );
};

export default EventDetailPage;
