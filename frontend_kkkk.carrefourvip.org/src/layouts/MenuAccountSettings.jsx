import {
    Menu,
    Box,
    Typography,
    Divider,
    MenuItem,
    ListItemIcon
} from '@mui/material';
import {
    AccountCircleRounded,
    LogoutRounded,
    ManageAccountsRounded,
    PersonRounded
} from '@mui/icons-material';
import useSmartNavigate from '../hooks/useSmartNavigate';
import web from '../routes/web';
import api from '../routes/api';
import { enqueueSnackbar } from 'notistack';

export default function MenuAccountSettings({
    anchorEl,
    setAnchorEl,
    setOpenProfile,
    setOpenAccount
}) {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useSmartNavigate();

    const handleLogout = async () => {
        const payload = {
            userId: user?.id,
            userType: 'admin'
        };

        try {
            await api.auth.logout(payload);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate(web.login);
            setAnchorEl(null);
        } catch (error) {
            enqueueSnackbar(
                Array.isArray(error.response?.data?.message)
                    ? error.response.data.message[0]
                    : error.response?.data?.message || error.message,
                {
                    variant: 'error'
                }
            );
        }
    };

    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
                elevation: 3,
                sx: { mt: 1.5, minWidth: 200 }
            }}
            transformOrigin={{
                horizontal: 'right',
                vertical: 'top'
            }}
            anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom'
            }}>
            <Box sx={{ px: 2, py: 1 }}>
                <Typography variant={'body1'}>{user?.name}</Typography>
                <Typography variant={'body2'} color={'textSecondary'}>{user?.email}</Typography>
            </Box>
            <Divider />
            <MenuItem
                onClick={() => {
                    setOpenProfile(true);
                    setAnchorEl(null);
                }}>
                <ListItemIcon>
                    <AccountCircleRounded fontSize={'small'} />
                </ListItemIcon>{' '}
                My Profile
            </MenuItem>
            <MenuItem
                onClick={() => {
                    setOpenAccount({ open: true, data: user });
                    setAnchorEl(null);
                }}>
                <ListItemIcon>
                    <ManageAccountsRounded fontSize={'small'} />
                </ListItemIcon>{' '}
                Account Settings
            </MenuItem>
            <Divider />
            <MenuItem
                onClick={handleLogout}
                color={'error'}>
                <ListItemIcon>
                    <LogoutRounded
                        fontSize={'small'}
                        color={'error'}
                    />
                </ListItemIcon>
                Logout
            </MenuItem>
        </Menu>
    );
}
