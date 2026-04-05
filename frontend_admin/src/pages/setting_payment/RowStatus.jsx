import { Chip, Box, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

const OPTIONS = [
    {
        label: '启用',
        value: 'active',
        color: 'primary'
    },
    {
        label: '禁用',
        value: 'inactive',
        color: 'default'
    },
    {
        label: '维护',
        value: 'maintenance',
        color: 'warning'
    }
];

export default function RowStatus({ status, permissions, onChange }) {
    const current = OPTIONS.find((s) => s.value === status);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (e) => {
        // if (permissions.includes('customer.changeUserMode'))
            setAnchorEl(e.currentTarget);
    };

    const handleSelect = (newValue) => {
        onChange(newValue);
        setAnchorEl(null);
    };

    return (
        <Box>
            <Chip
                label={current?.label}
                color={current?.color}
                size={'small'}
                onClick={handleClick}
                sx={{ cursor: 'pointer', fontSize: 12 }}
            />
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}>
                {OPTIONS.map((s) => (
                    <MenuItem
                        key={s.value}
                        sx={{ fontSize: 12, py: 0.5 }}
                        onClick={() => handleSelect(s.value)}>
                        {s.label}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}
