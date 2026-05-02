import {
    CurrencyExchangeRounded,
    LocalMallRounded,
    PaidRounded,
    TuneRounded
} from '@mui/icons-material';
import { Chip, Box } from '@mui/material';

const OPTIONS = [
    {
        label: '订单付款',
        value: 'order_payment',
        color: 'success',
        icon: <LocalMallRounded />
    },
    {
        label: '余额充值',
        value: 'deposit',
        color: 'primary',
        icon: <PaidRounded />
    },
    {
        label: '订单退款',
        value: 'refunded',
        color: 'secondary',
        icon: <CurrencyExchangeRounded />
    },
    {
        label: '手工调整',
        value: 'adjustment',
        color: 'warning',
        icon: <TuneRounded />
    }
];

export default function RowType({ status }) {
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
