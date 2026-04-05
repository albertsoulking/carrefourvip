import {
    LoginRounded,
    LogoutRounded
} from '@mui/icons-material';
import { Chip, Box } from '@mui/material';

const OPTIONS = [
    {
        label: '登录',
        value: 'login',
        color: 'primary',
        icon: <LoginRounded />
    },
    {
        label: '登出',
        value: 'logout',
        color: 'error',
        icon: <LogoutRounded />
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
                onClick={() => {}}
                sx={{ cursor: 'pointer', fontSize: 12 }}
            />
        </Box>
    );
}
