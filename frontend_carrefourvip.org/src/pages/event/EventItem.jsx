import { Box, Typography } from '@mui/material';

const EventItem = ({ data, onClick }) => {
    return (
        <Box
            sx={{
                p: 2,
                m: 1,
                borderRadius: 2,
                boxShadow: 'rgba(0, 0, 0, 0.1) 0 4px 12px'
            }}
            onClick={onClick}>
            <Typography>{data.name}</Typography>
            <Box
                display={'flex'}
                mt={2}>
                <Typography fontSize={12}>
                    {new Date(data.startDate).toLocaleDateString()}
                </Typography>
                <Typography fontSize={12}>
                    {data.endDate
                        ? ' - ' + new Date(data.endDate).toLocaleDateString
                        : ''}
                </Typography>
            </Box>
        </Box>
    );
};

export default EventItem;
