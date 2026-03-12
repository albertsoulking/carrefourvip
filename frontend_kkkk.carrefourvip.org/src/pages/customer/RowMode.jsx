import {
    BugReportRounded,
    PersonRounded
} from '@mui/icons-material';
import { Chip, Box } from '@mui/material';

const OPTIONS = [
    {
        label: '正式',
        value: 'live',
        color: 'primary',
        icon: <PersonRounded />
    },
    {
        label: '试玩',
        value: 'test',
        color: 'default',
        icon: <BugReportRounded />
    }
];

export default function RowMode({ status }) {
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
