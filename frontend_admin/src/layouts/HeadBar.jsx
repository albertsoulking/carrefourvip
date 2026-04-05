import {
    AppBar,
    Toolbar,
    IconButton,
    Box,
    Badge,
    Tooltip,
    Avatar,
    Typography,
    Select,
    MenuItem,
    useTheme
} from '@mui/material';
import { MenuRounded, NotificationsRounded } from '@mui/icons-material';
import { useState } from 'react';
import MenuAccountSettings from './MenuAccountSettings';
import MenuNotificationCenter from './MenuNotificationCenter';
import logo from '../assets/logo.png';
import i18n from '../config/i18n';
import ModalProfile from './ModalProfile';

export default function HeadBar({
    setMobileOpen,
    notifications,
    loadNotification,
    setOpenAccount
}) {
    const theme = useTheme();
    const user = JSON.parse(localStorage.getItem('user'));
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [accountAnchorEl, setAccountAnchorEl] = useState(null);
    const [openProfile, setOpenProfile] = useState(false);

    return (
        <AppBar
            position={'fixed'}
            sx={{
                bgcolor: '#fff',
                color: 'text.primary',
                boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen
                }),
                zIndex: (theme) => theme.zIndex.drawer + 1,
                borderRadius: 1
            }}>
            <Toolbar
                sx={{
                    flexWrap: 'wrap',
                    minHeight: '40px !important',
                    px: 1
                }}>
                <IconButton
                    color={'inherit'}
                    edge={'start'}
                    size={'small'}
                    onClick={() => setMobileOpen((isMobile) => !isMobile)}
                    sx={{ mr: 2, display: { sm: 'none' } }}>
                    <MenuRounded fontSize={'inherit'} />
                </IconButton>
                <Box
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    sx={{ my: 1 }}>
                    <img
                        src={logo}
                        alt=''
                        style={{
                            objectFit: 'cover',
                            width: 30,
                            marginRight: 4
                        }}
                    />
                    <Typography
                        sx={{
                            fontWeight: 700,
                            fontSize: 20,
                            color: '#222',
                            letterSpacing: 0.5
                        }}
                        translate={'no'}>
                        Carre
                        <Box
                            component={'span'}
                            sx={{ color: '#FFA500' }}
                            translate={'no'}>
                            four
                        </Box>
                    </Typography>
                </Box>
                <Box
                    sx={{ flexGrow: 1, minWidth: { xs: '8px', sm: '20px' } }}
                />
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 0.5, sm: 1 },
                        ml: { xs: 'auto' }
                    }}>
                    {/** Languages */}
                    <Select
                        value={i18n.language}
                        size={'small'}
                        sx={{ fontSize: 12 }}
                        onChange={(e) => i18n.changeLanguage(e.target.value)}>
                        <MenuItem
                            value={'zh-CN'}
                            sx={{ fontSize: 12 }}>
                            简体中文
                        </MenuItem>
                        <MenuItem
                            value={'en-US'}
                            sx={{ fontSize: 12 }}>
                            English
                        </MenuItem>
                    </Select>
                    {/* Notifications */}
                    <Tooltip title={'消息通知'}>
                        <IconButton
                            color={'inherit'}
                            onClick={(e) =>
                                setNotificationAnchorEl(e.currentTarget)
                            }
                            size={'small'}
                            sx={{ display: { xs: 'none', sm: 'flex' } }}>
                            <Badge
                                badgeContent={
                                    notifications.filter(
                                        (n) =>
                                            n.adminNotification[0].isRead ===
                                                0 && n.enableNoti === 1
                                    ).length
                                }
                                color={'error'}>
                                <NotificationsRounded fontSize={'small'} />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    {/* User profile */}
                    <Tooltip title={'账号设置'}>
                        <IconButton
                            onClick={(e) => setAccountAnchorEl(e.currentTarget)}
                            size={'small'}
                            aria-controls={
                                Boolean(accountAnchorEl)
                                    ? 'account-menu'
                                    : undefined
                            }
                            aria-haspopup={'true'}
                            aria-expanded={
                                Boolean(accountAnchorEl) ? 'true' : undefined
                            }>
                            <Avatar
                                sx={{
                                    width: 30,
                                    height: 30
                                }}>
                                {user?.name?.charAt(0) || ''}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    <MenuNotificationCenter
                        anchorEl={notificationAnchorEl}
                        setAnchorEl={setNotificationAnchorEl}
                        data={notifications}
                        loadNotification={loadNotification}
                    />
                    <MenuAccountSettings
                        anchorEl={accountAnchorEl}
                        setAnchorEl={setAccountAnchorEl}
                        setOpenProfile={setOpenProfile}
                        setOpenAccount={setOpenAccount}
                    />
                    <ModalProfile
                        open={openProfile}
                        setOpen={setOpenProfile}
                    />
                </Box>
            </Toolbar>
        </AppBar>
    );
}
