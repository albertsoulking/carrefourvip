import { DeleteRounded, EditRounded, MoreVertOutlined } from '@mui/icons-material';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

const RowActions = ({ data }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const menuItems = [
        
    ];

    return (
        <Box>
            <IconButton size={'small'} onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVertOutlined fontSize={'inherit'} />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                onClose={() => setAnchorEl(null)}>
                {menuItems.map((item, index) => (
                    <MenuItem
                        key={index}
                        sx={{ fontSize: 12, color: item.color, py: 0.5 }}
                        onClick={item.onClick}>
                        {item.label}{item.icon}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default RowActions;
