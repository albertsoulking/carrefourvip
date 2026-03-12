import {
    BlockRounded,
    CheckCircleRounded
} from '@mui/icons-material';
import { Chip, Box } from '@mui/material';

const OPTIONS = [
    {
        label: '正常',
        value: true,
        color: 'primary',
        icon: <CheckCircleRounded />
    },
    {
        label: '封禁',
        value: false,
        color: 'error',
        icon: <BlockRounded />
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
                onClick={() => {}}
                sx={{ cursor: 'pointer', fontSize: 12 }}
            />
        </Box>
    );
}
