import { Chip, Box } from '@mui/material';

const OPTIONS = [
    {
        label: 'Standard',
        value: 'standard',
        color: 'primary'
    },
    {
        label: 'Express',
        value: 'express',
        color: 'secondary'
    }
];

export default function DeliveryMethod({ status }) {
    const current = OPTIONS.find((s) => s.value === status);

    return (
        <Box>
            <Chip
                label={current?.label}
                color={current?.color}
                onClick={() => {}}
                size={'small'}
                sx={{ cursor: 'pointer', fontSize: 12 }}
            />
        </Box>
    );
}
