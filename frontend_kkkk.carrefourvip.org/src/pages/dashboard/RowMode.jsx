import {
    BugReportRounded,
    PersonRounded
} from '@mui/icons-material';
import { Chip, Box } from '@mui/material';

const OPTIONS = [
    {
        label: 'table.live',
        value: 'live',
        color: 'primary',
        icon: <PersonRounded />
    },
    {
        label: 'table.test',
        value: 'test',
        color: 'default',
        icon: <BugReportRounded />
    }
];

export default function RowMode({ status, t }) {
    const current = OPTIONS.find((s) => s.value === status);

    return (
        <Box>
            <Chip
                label={t(current?.label)}
                color={current?.color}
                icon={current?.icon}
                size={'small'}
                onClick={() => {}}
                sx={{ cursor: 'pointer', fontSize: 12 }}
            />
        </Box>
    );
}
