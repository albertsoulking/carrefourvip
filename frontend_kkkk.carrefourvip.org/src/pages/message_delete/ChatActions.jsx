import { DeleteRounded, MoreVertOutlined } from '@mui/icons-material';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import api from '../../routes/api';

const ChatActions = ({
    data,
    isLeft,
    setMessages,
    loadData,
    searchModal,
    permissions
}) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const menuItems = [
        {
            label: '删除',
            color: '#d32f2f',
            icon: (
                <DeleteRounded
                    color={'error'}
                    fontSize={'inherit'}
                    sx={{ mr: 1 }}
                />
            ),
            disabled: !permissions.includes('message.delete'),
            onClick: async () => {
                await api.message.delete({ msgId: data?.id });
                setMessages((prev) =>
                    prev.filter((msg) => msg.id !== data?.id)
                );
                loadData(searchModal);
            }
        }
    ];

    return (
        <Box>
            <IconButton
                size={'small'}
                onClick={(e) => setAnchorEl(e.currentTarget)}>
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
                    horizontal: isLeft ? 'left' : 'right'
                }}
                onClose={() => setAnchorEl(null)}>
                {menuItems.map((item, index) => (
                    <MenuItem
                        key={index}
                        sx={{ fontSize: 12, color: item.color, py: 0.5 }}
                        onClick={item.onClick}
                        disabled={item.disabled}>
                        {item.icon}
                        {item.label}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default ChatActions;
