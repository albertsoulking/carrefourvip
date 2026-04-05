import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, CssBaseline, Toolbar, useTheme, Tabs, Tab } from '@mui/material';
import HeadBar from './HeadBar';
import SideBar from './SideBar';
import api from '../routes/api';
import useSmartNavigate from '../hooks/useSmartNavigate';
import { useTranslation } from 'react-i18next';
import web from '../routes/web';
import { CloseRounded } from '@mui/icons-material';
import useNotificationSocket from '../hooks/useNotificationSocket';
import ModalAccountSettings from './ModalAccountSettings';
import ModalChangePassword from './ModalChangePassword';
import ModalVerifyPassword from './ModalVerifyPassword';
import ModalTwoFactorAuthentication from './ModalTwoFactorAuthentication';
import ModalTwoFactorRemove from './ModalTwoFactorRemove';
import logo from '../assets/logo.png';
import usePermissionStore from '../hooks/usePermissionStore';
import { flattenPermissions } from '../hooks/flattenPermissions';
import { enqueueSnackbar } from 'notistack';

const TABS_STORAGE_KEY = 'app_tabs';
const ACTIVE_TAB_KEY = 'active_tab';

const drawerWidth = 240;
const miniDrawerWidth = 70;

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            when: 'beforeChildren',
            staggerChildren: 0.1
        }
    },
    out: { opacity: 0, y: 20, transition: { duration: 0.3 } }
};

const DashboardLayout = () => {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useSmartNavigate();
    const { t } = useTranslation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [roleMenus, setRoleMenus] = useState([]);
    const [tabs, setTabs] = useState([
        { label: t('nav.home'), path: web.dashboard }
    ]);
    const [isRestoring, setIsRestoring] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [openAccountSetting, setOpenAccountSetting] = useState({
        open: false,
        data: null
    });
    const [openChangePassword, setOpenChangePassword] = useState({
        open: false,
        data: null
    });
    const [openVerifyPassword, setOpenVerifyPassword] = useState({
        open: false,
        data: null
    });
    const [openAddTwoFactor, setOpenAddTwoFactor] = useState({
        open: false,
        data: null
    });
    const [openRemoveTwoFactor, setOpenRemoveTwoFactor] = useState({
        open: false,
        data: null
    });
    const isLoggedIn = localStorage.getItem('token') !== null;
    const setPermissions = usePermissionStore((state) => state.setPermissions);
    const currentPath = location.pathname;
    const hasMountedRef = useRef(false);

    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            return;
        }

        // 正常的 currentPath 跳转逻辑
    }, [currentPath]);

    useEffect(() => {
        fetchData();
        loadNotification();
    }, []);

    useEffect(() => {
        if (
            !isRestoring &&
            roleMenus.length !== 0 &&
            !findRoutePermission(roleMenus)
        )
            navigate('404');
    }, [roleMenus, isRestoring]);

    useEffect(() => {
        if (isRestoring) return;

        const exists = tabs.find((tab) => tab.path === currentPath);
        if (!exists) {
            const matched = findMenuLabel(roleMenus, currentPath);
            if (matched) {
                setTabs((prev) => [
                    ...prev,
                    {
                        label: t(`nav.${matched.name}`) || '未知页面',
                        path: currentPath
                    }
                ]);
            }
        }
    }, [currentPath, roleMenus, isRestoring]);

    // === 初始化时恢复 Tabs 和 active path，但要等 roleMenus 有值 ===
    useEffect(() => {
        if (!isRestoring || roleMenus.length === 0) return;

        const storedTabs = localStorage.getItem(TABS_STORAGE_KEY);
        const storedActive = localStorage.getItem(ACTIVE_TAB_KEY);

        if (storedTabs) {
            try {
                const parsedTabs = JSON.parse(storedTabs);
                if (Array.isArray(parsedTabs)) setTabs(parsedTabs);
            } catch (e) {
                console.warn('Failed to parse stored tabs');
            }
        }

        if (storedActive && storedActive !== location.pathname) {
            navigate(storedActive, { replace: true });
        }

        setIsRestoring(false); // ✅ 恢复完毕
    }, [isRestoring, roleMenus]);

    useEffect(() => {
        if (!isRestoring) {
            localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
        }
    }, [tabs, isRestoring]);

    useEffect(() => {
        if (!isRestoring) {
            localStorage.setItem(ACTIVE_TAB_KEY, location.pathname);
        }
    }, [location.pathname, isRestoring]);

    useEffect(() => {
        setPermissions(flattenPermissions(roleMenus));
    }, [roleMenus, setPermissions]);

    const handleTabChange = (e, newValue) => {
        navigate(newValue);
    };

    const handleTabClose = (targetPath) => {
        setTabs((prev) => prev.filter((t) => t.path !== targetPath));
        if (currentPath === targetPath && tabs.length > 1) {
            const next = tabs.find((t) => t.path !== targetPath);
            if (next) navigate(next.path);
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
        return matchedKey ? t(matchedKey) : item?.label || item?.title || item?.name || '';
    };

    const getTabLabel = (path, fallbackLabel = '') => {
        if (path === web.dashboard) {
            return t('nav.home');
        }

        const matched = findMenuLabel(roleMenus, path);
        if (!matched) {
            return fallbackLabel;
        }

        const parent = roleMenus.find((menu) =>
            menu.children?.some((child) => child.path === path)
        );

        return getNavLabel(matched, parent?.name);
    };

    const fetchData = async () => {
        const res = await api.roleMenu.getMenus();
        setRoleMenus(res.data);
    };

    const findRoutePermission = (menus) => {
        for (const menu of menus) {
            if (menu.path === location.pathname) return true;
            if (menu.children?.length > 0 && findRoutePermission(menu.children))
                return true;
        }
        return false;
    };

    const findMenuLabel = (menus, path) => {
        for (const menu of menus) {
            if (menu.path === path) return menu;
            if (menu.children?.length > 0) {
                const found = findMenuLabel(menu.children, path);
                if (found) return found;
            }
        }
        return null;
    };

    useNotificationSocket((noti) => {
        if (!noti) return;

        setNotifications(prev => [...prev, noti]);

        if (noti.enableNoti === 0) return;

        // 页面可见 -> Snackbar
        if (document.visibilityState === 'visible') {
            enqueueSnackbar(noti.content, {
                variant: 'primary'
            });
        } else {
            // 页面不可见 -> 浏览器通知
            if (
                'Notification' in window &&
                Notification.permission === 'granted'
            ) {
                const notif = new Notification(noti.title, {
                    body: noti.content,
                    icon: logo
                });

                notif.onclick = () => {
                    window.focus(); // 聚焦到浏览器
                    if (noti.path) {
                        navigate(noti.path); // 使用 react-router 跳转
                    }
                };
            }
        }
    });

    const loadNotification = async () => {
        const res = await api.noti.getAll();
        setNotifications((prev) => {
            const merged = [...prev, ...res.data];
            const unique = Array.from(
                new Map(merged.map((item) => [item.id, item])).values()
            );
            return unique;
        });
    };

    if (!isLoggedIn) return <Outlet />;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <HeadBar
                setSidebarCollapsed={setSidebarCollapsed}
                setMobileOpen={setMobileOpen}
                notifications={notifications}
                loadNotification={loadNotification}
                setOpenAccount={setOpenAccountSetting}
            />
            <SideBar
                navData={roleMenus}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                notifications={notifications}
                loadNotification={loadNotification}
            />
            <Box
                component={'main'}
                sx={{
                    flexGrow: 1,
                    width: {
                        sm: `calc(100% - ${
                            sidebarCollapsed ? miniDrawerWidth : drawerWidth
                        }px)`
                    },
                    minHeight: '100vh',
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen
                    })
                }}>
                <Toolbar />

                <Tabs
                    value={
                        tabs.some((tab) => tab.path === currentPath)
                            ? currentPath
                            : false
                    }
                    onChange={handleTabChange}
                    variant={'scrollable'}
                    scrollButtons={'auto'}
                    sx={{
                        mx: 2,
                        minHeight: 'auto',
                        minWidth: 'auto'
                    }}>
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.path}
                            value={tab.path}
                            label={
                                <Box
                                    display={'flex'}
                                    alignItems={'center'}>
                                    <span
                                        style={{
                                            color:
                                                tab.path === currentPath
                                                    ? '#fff'
                                                    : '#000',
                                            textTransform: 'capitalize'
                                        }}>
                                        {getTabLabel(tab.path, tab.label)}
                                    </span>
                                    {tab.path !== web.dashboard && (
                                        <Box
                                            component={'span'}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTabClose(tab.path);
                                            }}
                                            sx={{
                                                ml: 1,
                                                display: 'inline-flex',
                                                cursor: 'pointer',
                                                color:
                                                    tab.path === currentPath
                                                        ? '#fff'
                                                        : '#000',
                                                '&:hover': {
                                                    color: 'error.main'
                                                }
                                            }}>
                                            <CloseRounded fontSize={'small'} />
                                        </Box>
                                    )}
                                </Box>
                            }
                            sx={{
                                mx: 0.5,
                                py: 1,
                                px: 1,
                                fontSize: 12,
                                minHeight: 'auto',
                                minWidth: 'auto',
                                overflow: 'auto',
                                borderRadius: 1,
                                bgcolor:
                                    tab.path === currentPath
                                        ? '#1976d2'
                                        : 'transparent',
                                boxShadow:
                                    tab.path === currentPath
                                        ? '0 6px 6px rgba(0, 0, 0, 0.2)'
                                        : 'none'
                            }}
                        />
                    ))}
                </Tabs>

                <motion.div
                    initial={'initial'}
                    animate={'in'}
                    exit={'out'}
                    variants={pageVariants}
                    style={{ height: 'fit-content' }}>
                    <Outlet
                        context={{
                            roleMenus,
                            notifications,
                            loadNotification
                        }}
                    />
                </motion.div>
            </Box>
            <ModalAccountSettings
                open={openAccountSetting.open}
                data={openAccountSetting.data}
                setOpen={setOpenAccountSetting}
                setOpenChangePassword={setOpenChangePassword}
                setOpenVerifyPassword={setOpenVerifyPassword}
            />
            <ModalChangePassword
                open={openChangePassword.open}
                data={openChangePassword.data}
                setOpen={setOpenChangePassword}
                setOpenAccountSetting={setOpenAccountSetting}
            />
            <ModalVerifyPassword
                open={openVerifyPassword.open}
                data={openVerifyPassword.data}
                setOpen={setOpenVerifyPassword}
                setOpenAccountSetting={setOpenAccountSetting}
                setOpenAddTwoFactor={setOpenAddTwoFactor}
                setOpenRemoveTwoFactor={setOpenRemoveTwoFactor}
            />
            <ModalTwoFactorAuthentication
                open={openAddTwoFactor.open}
                data={openAddTwoFactor.data}
                setOpen={setOpenAddTwoFactor}
                setOpenAccountSetting={setOpenAccountSetting}
            />
            <ModalTwoFactorRemove
                open={openRemoveTwoFactor.open}
                data={openAddTwoFactor.data}
                setOpen={setOpenRemoveTwoFactor}
                setOpenAccountSetting={setOpenAccountSetting}
            />
        </Box>
    );
};

export default DashboardLayout;
