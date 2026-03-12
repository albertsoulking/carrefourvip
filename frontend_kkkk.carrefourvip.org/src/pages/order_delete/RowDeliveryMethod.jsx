import {
    DeliveryDiningRounded,
    LocalShippingRounded
} from '@mui/icons-material';
import { Chip, Box } from '@mui/material';

const OPTIONS = [
    {
        label: 'table.standard',
        value: 'standard',
        color: 'primary',
        icon: <DeliveryDiningRounded />
    },
    {
        label: 'table.express',
        value: 'express',
        color: 'secondary',
        icon: <LocalShippingRounded />
    }
];

export default function RowDeliveryMethod({ status, t }) {
    const current = OPTIONS.find((s) => s.value === status);

    return (
        <Box>
            <Chip
                label={t(current?.label)}
                color={current?.color}
                icon={current?.icon}
                onClick={() => {}}
                size={'small'}
                sx={{ cursor: 'pointer', fontSize: 12 }}
            />
        </Box>
    );
}
