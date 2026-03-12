import { Menu, MenuItem, Box, Chip } from '@mui/material';
import { useState } from 'react';
import usePermissionStore from '../../hooks/usePermissionStore';

export default function RowParent({ value, data, onChange }) {
    const permissions = usePermissionStore((state) => state.permissions);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (e) => {
        if (permissions.includes('agent.changeParent'))
            setAnchorEl(e.currentTarget);
    };

    const handleSelect = (newValue) => {
        onChange(newValue);
        setAnchorEl(null);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Chip
                label={value ?? '-'}
                size={'small'}
                color={'info'}
                sx={{ cursor: 'pointer', fontSize: 12 }}
                onClick={handleClick}
            />
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}>
                {data.map((s) => (
                    <MenuItem
                        key={s.id}
                        onClick={() => handleSelect(s.id)}
                        sx={{ fontSize: 12, py: 0.5 }}>
                        {s.name}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}
