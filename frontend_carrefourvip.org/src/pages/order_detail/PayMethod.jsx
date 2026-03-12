import { Box, Chip } from '@mui/material';

const OPTIONS = [
    {
        label: 'Stripe',
        value: 'stripe',
        color: 'info'
    },
    {
        label: 'PayPal',
        value: 'paypal',
        color: 'default'
    },
    {
        label: 'Balance',
        value: 'balance',
        color: 'default'
    },
    {
        label: 'Hybrid',
        value: 'hybrid',
        color: 'secondary'
    },
    {
        label: 'Bank Card',
        value: 'card',
        color: 'success'
    },
    {
        label: 'Pay2s',
        value: 'pay2s',
        color: 'success'
    },
    {
        label: 'Lemon Squeezy',
        value: 'lemon',
        color: 'warning'
    },
    {
        label: 'Payment on behalf of others',
        value: 'behalf',
        color: 'default'
    },
    {
        label: 'Star Pay',
        value: 'starpay',
        color: 'info'
    },
    {
        label: 'Friends & Family',
        value: 'faf',
        color: 'info'
    },
    {
        label: 'Wise',
        value: 'wise',
        color: 'info'
    }
];

export default function PayMethod({ status }) {
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
