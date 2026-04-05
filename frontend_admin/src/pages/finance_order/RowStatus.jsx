import {
    AccessTimeFilledRounded,
    CancelRounded,
    CheckCircleRounded,
    CurrencyExchangeRounded
} from '@mui/icons-material';
import { Chip, Box } from '@mui/material';

const OPTIONS = [
    {
        label: '等待中',
        value: 'pending',
        color: 'default',
        icon: <AccessTimeFilledRounded />
    },
    {
        label: '已完成',
        value: 'completed',
        color: 'primary',
        icon: <CheckCircleRounded />
    },
    {
        label: '已取消',
        value: 'cancelled',
        color: 'error',
        icon: <CancelRounded/>
    },
    {
        label: '已退款',
        value: 'refunded',
        color: 'secondary',
        icon: <CurrencyExchangeRounded />
    }
];

export default function RowStatus({ status }) {
    const current = OPTIONS.find((s) => s.value === status);

    return (
        <Box>
            <Chip
                label={current?.label}
                color={current?.color}
                icon={current?.icon}
                size={'small'}
                sx={{ cursor: 'pointer', fontSize: 12 }}
                onClick={() => {}}
            />
        </Box>
    );
}
