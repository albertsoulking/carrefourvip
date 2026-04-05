import {
    NorthWestRounded,
    SouthEastRounded
} from '@mui/icons-material';
import { Chip, Box } from '@mui/material';

const OPTIONS = [
    {
        label: '出',
        value: 'in',
        color: 'error',
        icon: <NorthWestRounded />
    },
    {
        label: '进',
        value: 'out',
        color: 'success',
        icon: <SouthEastRounded />
    }
];

export default function RowDirection({ status }) {
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
