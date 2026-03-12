import { Box, Chip, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import usePermissionStore from '../../hooks/usePermissionStore';

const OPTIONS = [
    {
        label: '管理员',
        value: 'admin',
        color: 'primary'
    },
    {
        label: '代理',
        value: 'agent',
        color: 'info'
    },
    {
        label: '团长',
        value: 'head',
        color: 'secondary'
    },
    {
        label: '组员',
        value: 'team',
        color: 'success'
    },
    {
        label: '客服',
        value: 'support',
        color: 'warning'
    }
];

export default function RowRole({ status, onChange }) {
    const permissions = usePermissionStore((state) => state.permissions);
    const [anchorEl, setAnchorEl] = useState(null);
    const current = OPTIONS.find((s) => s.value === status);

    const handleClick = (e) => {
        if (permissions.includes('agent.changeRole'))
            setAnchorEl(e.currentTarget);
    };

    const handleSelect = (newStatus) => {
        onChange(newStatus);
        setAnchorEl(null);
    };

    return (
        <Box>
            <Chip
                label={current?.label}
                color={current?.color}
                icon={current?.icon}
                size={'small'}
                sx={{ cursor: 'pointer', fontSize: 12 }}
                onClick={handleClick}
            />
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}>
                {OPTIONS.map((s) => (
                    <MenuItem
                        key={s.value}
                        sx={{ fontSize: 12, py: 0.5 }}
                        onClick={() => handleSelect(s.value)}
                        selected={s.value === status}>
                        {s.label}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}
