import { useEffect, useRef, useState } from 'react';
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Box,
    Divider,
    useMediaQuery,
    Typography,
    Badge,
    IconButton
} from '@mui/material';
import {
    FolderOutlined,
    FolderRounded,
    ExpandLessRounded,
    ExpandMoreRounded,
    MenuOpenRounded
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useSmartNavigate from '../hooks/useSmartNavigate';
import { useLocation } from 'react-router-dom';
import { iconMap } from './iconMap';
import { enqueueSnackbar } from 'notistack';
import api from '../routes/api';

const SideBar = ({
    navData,
    mobileOpen,
    setMobileOpen,
    notifications,
    loadNotification
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState({});
    const navigate = useSmartNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery('(max-width:600px)');
    const [collapse, setCollapse] = useState(false);
    const processedNotiIdsRef = useRef(new Set());

    useEffect(() => {
        const notiIds = notifications
            .filter((noti) => noti.path === location.pathname)
            .map((noti) => noti.id)
            .filter((id) => !processedNotiIdsRef.current.has(id)); // 只处理未处理过的

        if (notiIds.length > 0) {
            handleOnRead(notiIds);
            notiIds.forEach((id) => processedNotiIdsRef.current.add(id));
        }
    }, [location.pathname, notifications]);

    const toggle = (label) => {
        setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const isActive = (path) => {
        if (!path) return false;
        return location.pathname === path;
    };

    const handleOnRead = async (notiIds) => {
        try {
            await api.noti.update({ ids: notiIds });
            loadNotification();
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

    const getNavLabel = (item, parentName = null) => {
        const candidates = [];

        if (parentName && item?.name) {
            candidates.push(`nav.${parentName}.${item.name}`);
        }

        if (item?.children?.length > 0 && item?.name) {
            candidates.push(`nav.${item.name}.home`);
        }

        if (item?.name) {
            candidates.push(`nav.${item.name}`);
        }

        const matchedKey = candidates.find((key) => t(key) !== key);
        return matchedKey ? t(matchedKey) : item?.label || item?.title || item?.name;
    };

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={!isMobile || mobileOpen || undefined}
            onClose={() => setMobileOpen(false)}
            sx={{
                position: 'relative',
                width: collapse ? 60 : 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: collapse ? 60 : 240,
                    backgroundColor: '#fff',
                    color: '#111',
                    borderRight: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }
            }}>
            <List sx={{ mt: 6, mb: 4, overflowX: 'hidden' }}>
                {navData
                    .filter((item) => item.visible === 1)
                    .map((item, index) => (
                        <Box key={index}>
                            <ListItemButton
                                onClick={() =>
                                    item.children.length === 0
                                        ? navigate(item.path)
                                        : toggle(item.name)
                                }
                                selected={isActive(item.path)}
                                sx={{
                                    mx: 0.5,
                                    mb: 0.5,
                                    borderRadius: 2,
                                    py: 0.5,
                                    '&:hover': {
                                        bgcolor: '#3a86ff1a',
                                        color: '#3A86FF',
                                        borderRadius: 2,
                                        '& .MuiListItemIcon-root': {
                                            color: '#1976d2'
                                        }
                                    },
                                    '&.Mui-selected': {
                                        bgcolor: '#1976d2',
                                        '& .MuiListItemIcon-root': {
                                            color: '#fff'
                                        },
                                        '&:hover': {
                                            bgcolor: '#1976d2'
                                        }
                                    }
                                }}>
                                <ListItemIcon
                                    sx={{
                                        transition: 'all 0.3s ease',
                                        color: isActive(item.path)
                                            ? '#3A86FF'
                                            : ''
                                    }}>
                                    {isActive(item.path)
                                        ? iconMap[item.icon]?.rounded ?? (
                                              <FolderRounded
                                                  fontSize={'small'}
                                              />
                                          )
                                        : iconMap[item.icon]?.outlined ?? (
                                              <FolderOutlined
                                                  fontSize={'small'}
                                              />
                                          )}
                                </ListItemIcon>
                                {!collapse && (
                                    <>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    fontSize={12}
                                                    sx={{
                                                        color: isActive(
                                                            item.path
                                                        )
                                                            ? '#fff'
                                                            : ''
                                                    }}>
                                                    {getNavLabel(item)}
                                                </Typography>
                                            }
                                            sx={{ ml: -3 }}
                                        />
                                        {item.children.length !== 0 &&
                                            (open[item.name] ? (
                                                <ExpandLessRounded
                                                    fontSize={'small'}
                                                    sx={{ width: '3rem' }}
                                                />
                                            ) : (
                                                <ExpandMoreRounded
                                                    fontSize={'small'}
                                                    sx={{ width: '3rem' }}
                                                />
                                            ))}
                                        <Badge
                                            badgeContent={
                                                notifications.filter(
                                                    (noti) =>
                                                        noti
                                                            .adminNotification[0]
                                                            .isRead === 0 &&
                                                        (item.children
                                                            .length === 0
                                                            ? item.path ===
                                                              noti.path
                                                            : item.children.some(
                                                                  (child) =>
                                                                      child.path ===
                                                                      noti.path
                                                              )) &&
                                                        noti.enableNoti === 1
                                                ).length
                                            }
                                            color={'error'}
                                            overlap={'circular'}
                                            slotProps={{
                                                badge: {
                                                    sx: {
                                                        fontSize: 10
                                                    }
                                                }
                                            }}
                                        />
                                    </>
                                )}
                            </ListItemButton>
                            {item.children.length !== 0 && item.children && (
                                <Collapse
                                    in={open[item.name]}
                                    timeout={'auto'}
                                    unmountOnExit>
                                    <List
                                        component={'div'}
                                        disablePadding>
                                        {item.children
                                            .filter(
                                                (child) => child.visible === 1
                                            )
                                            .map((child, idx) => (
                                                <ListItemButton
                                                    key={idx}
                                                    onClick={() =>
                                                        navigate(child.path)
                                                    }
                                                    selected={isActive(
                                                        child.path
                                                    )}
                                                    sx={{
                                                        pl: 9,
                                                        mx: 0.5,
                                                        mb: 0.5,
                                                        borderRadius: 2,
                                                        py: 0.5,
                                                        '&:hover': {
                                                            bgcolor:
                                                                '#3a86ff1a',
                                                            color: '#3A86FF',
                                                            borderRadius: 2,
                                                            '& .MuiListItemIcon-root':
                                                                {
                                                                    color: '#1976d2'
                                                                }
                                                        },
                                                        '&.Mui-selected': {
                                                            bgcolor: '#1976d2',
                                                            '& .MuiListItemIcon-root':
                                                                {
                                                                    color: '#fff'
                                                                },
                                                            '&:hover': {
                                                                bgcolor:
                                                                    '#1976d2'
                                                            }
                                                        }
                                                    }}>
                                                    {!collapse && (
                                                        <>
                                                            <ListItemText
                                                                primary={
                                                                    <Typography
                                                                        fontSize={
                                                                            12
                                                                        }
                                                                        sx={{
                                                                            color: isActive(
                                                                                child.path
                                                                            )
                                                                                ? '#fff'
                                                                                : ''
                                                                        }}>
                                                                        {getNavLabel(
                                                                            child,
                                                                            item.name
                                                                        )}
                                                                    </Typography>
                                                                }
                                                                sx={{ ml: -3 }}
                                                            />
                                                            <Badge
                                                                badgeContent={
                                                                    notifications.filter(
                                                                        (
                                                                            noti
                                                                        ) =>
                                                                            noti
                                                                                .adminNotification[0]
                                                                                .isRead ===
                                                                                0 &&
                                                                            noti.path ===
                                                                                child.path &&
                                                                            noti.enableNoti ===
                                                                                1
                                                                    ).length
                                                                }
                                                                color={'error'}
                                                                overlap={
                                                                    'circular'
                                                                }
                                                                slotProps={{
                                                                    badge: {
                                                                        sx: {
                                                                            fontSize: 10
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </>
                                                    )}
                                                </ListItemButton>
                                            ))}
                                    </List>
                                </Collapse>
                            )}
                            {[2, 4, 6, 7, 8].includes(index) && (
                                <Divider sx={{ my: 1 }} />
                            )}
                        </Box>
                    ))}
            </List>
            <Box
                position={'absolute'}
                bottom={0}
                right={10}>
                <IconButton
                    color={'primary'}
                    onClick={() => setCollapse((prev) => !prev)}>
                    <MenuOpenRounded
                        color={'primary'}
                        sx={{ transform: collapse ? 'rotate(180deg)' : '' }}
                    />
                </IconButton>
            </Box>
        </Drawer>
    );
};

export default SideBar;
