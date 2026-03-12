import {
    CancelRounded,
    CheckCircleRounded
} from '@mui/icons-material';
import { Chip, Box } from '@mui/material';

const OPTIONS = [
    {
        label: '处理中',
        value: 'opened',
        color: 'success',
        icon: <CheckCircleRounded />
    },
    {
        label: '已关闭',
        value: 'closed',
        color: 'error',
        icon: <CancelRounded />
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
