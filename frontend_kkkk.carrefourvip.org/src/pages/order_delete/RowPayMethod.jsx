import { Box, Chip } from '@mui/material';

const OPTIONS = [
    {
        label: 'table.stripe',
        value: 'stripe',
        color: 'info'
    },
    {
        label: 'table.paypal',
        value: 'paypal',
        color: 'primary'
    },
    {
        label: 'table.balance',
        value: 'balance',
        color: 'default'
    },
    {
        label: 'table.hybrid',
        value: 'hybrid',
        color: 'secondary'
    },
    {
        label: 'table.card',
        value: 'card',
        color: 'success'
    },
    {
        label: 'table.pay2s',
        value: 'pay2s',
        color: 'success'
    },
    {
        label: 'table.lemon',
        value: 'lemon',
        color: 'warning'
    },
    {
        label: 'table.behalf',
        value: 'behalf',
        color: 'default'
    },
    {
        label: 'table.starpay',
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

export default function RowPayMethod({ status, t }) {
    const current = OPTIONS.find((s) => s.value === status);

    return (
        <Box>
            <Chip
                label={t(current?.label)}
                color={current?.color}
                icon={current?.icon}
                size={'small'}
                sx={{ cursor: 'pointer', fontSize: 12 }}
                onClick={() => {}}
            />
        </Box>
    );
}
