import { Chip, Box, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

const OPTIONS = [
    {
        label: '否',
        value: 0,
        color: 'default'
    },
    {
        label: '是',
        value: 1,
        color: 'primary'
    }
];

export default function RowVisible({ status, permissions, onChange }) {
    const current = OPTIONS.find((s) => s.value === status);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (e) => {
        // if (permissions.includes(''))
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
