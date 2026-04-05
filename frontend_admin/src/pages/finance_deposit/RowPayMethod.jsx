import { Box, Chip } from '@mui/material';

const OPTIONS = [
    {
        label: 'Stripe支付',
        value: 'stripe',
        color: 'info'
    },
    {
        label: '贝宝支付',
        value: 'paypal',
        color: 'default'
    },
    {
        label: '余额支付',
        value: 'balance',
        color: 'default'
    },
    {
        label: '混合支付',
        value: 'hybrid',
        color: 'secondary'
    },
    {
        label: '银行卡支付',
        value: 'card',
        color: 'success'
    },
    {
        label: 'Pay2s支付',
        value: 'pay2s',
        color: 'success'
    },
    {
        label: 'Lemon支付',
        value: 'lemon',
        color: 'warning'
    },
    {
        label: '代付款',
        value: 'behalf',
        color: 'default'
    },
    {
        label: 'Star支付',
        value: 'starpay',
        color: 'info'
    },
    {
        label: 'table.faf',
        value: 'faf',
        color: 'info'
    },
    {
        label: 'table.wise',
        value: 'wise',
        color: 'info'
    }
];

export default function RowPayMethod({ status }) {
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
