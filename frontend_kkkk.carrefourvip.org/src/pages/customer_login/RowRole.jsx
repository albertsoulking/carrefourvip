import { Chip, Box } from '@mui/material';

const OPTIONS = [
    {
        label: '代理',
        value: 'agent'
    },
    {
        label: '员工',
        value: 'team'
    }
];

export default function RowRole({ status }) {
    const current = OPTIONS.find((s) => s.value === status);

    return (
        <Box>
            <Chip
                label={current?.label}
                color={'info'}
                size={'small'}
                onClick={() => {}}
                sx={{ cursor: 'pointer', fontSize: 12 }}
            />
        </Box>
    );
}
