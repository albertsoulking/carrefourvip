import {
    AccessTimeFilledRounded,
    CancelRounded,
    CheckCircleRounded,
    CurrencyExchangeRounded
} from '@mui/icons-material';
import { Chip, Box } from '@mui/material';

const OPTIONS = [
    {
        label: 'table.pending',
        value: 'pending',
        color: 'default',
        icon: <AccessTimeFilledRounded />
    },
    {
        label: 'table.paid',
        value: 'paid',
        color: 'primary',
        icon: <CheckCircleRounded />
    },
    {
        label: 'table.cancelled',
        value: 'cancelled',
        color: 'error',
        icon: <CancelRounded />
    },
    {
        label: 'table.refunded',
        value: 'refunded',
        color: 'secondary',
        icon: <CurrencyExchangeRounded />
    }
];

export default function RowPaymentStatus({ status, t }) {
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
