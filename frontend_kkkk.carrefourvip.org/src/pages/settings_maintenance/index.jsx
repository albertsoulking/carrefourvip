import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
    PhotoSizeSelectLargeRounded,
    RestartAltRounded
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15
        }
    }
};

const SettingMaintenancePage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const { roleMenus } = useOutletContext();
    const [loadingIndex, setLoadingIndex] = useState(null);
    const [count, setCount] = useState(0);
    const [showCount, setShowCount] = useState(false);
    const [message, setMessage] = useState('');
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        setPermissions(findPermissionsByPath(roleMenus).map((p) => p.key));
    }, [roleMenus]);

    const handleAction = async (apiFunc, index) => {
        try {
            setLoadingIndex(index);

            await apiFunc();

            setTimeout(() => {
                setLoadingIndex(null);
                enqueueSnackbar('操作成功!', {
                    variant: 'success'
                });
            }, 1000);
        } catch (error) {
            enqueueSnackbar(
                Array.isArray(error.response?.data?.message)
                    ? error.response.data.message[0]
                    : error.response?.data?.message || error.message,
                {
                    variant: 'error'
                }
            );
        } finally {
            setLoadingIndex(null);
        }
    };

    const findPermissionsByPath = (menus) => {
        for (const menu of menus) {
            if (menu.children?.length > 0) {
                const result = findPermissionsByPath(menu.children);
                if (result && result.length > 0) return result;
            }

            if (
                menu.path === location.pathname &&
                menu.permissions?.length > 0
            ) {
                return menu.permissions;
            }
        }
        return [];
    };

    const appItems = [
        {
            visible: permissions.includes('maintenance.generateThumbnails'),
            title: '批量生成缩略图',
            desc: '重新生成 /uploads/images 下的缩略图，适用于图片上传后未自动生成情况。每次请求处理100张照片。',
            btnTxt: '生成缩略图',
            btnIcon: <PhotoSizeSelectLargeRounded fontSize={'inherit'} />,
            helperText: showCount
                ? `✅ 已生成${count}个缩略图，${message}`
                : '',
            onClick: (index) =>
                handleAction(async () => {
                    let page = 1;
                    let nextPage = true;

                    setShowCount(true);
                    setCount(0);

                    while (nextPage) {
                        const res = await api.utility.genrateThumbnail({
                            adminId: user?.id,
                            page
                        });
                        nextPage = res.data.nextPage;
                        setMessage(res.data.message);
                        setCount((count) => count + res.data.generatedCount);
                        page++;
                    }

                    setTimeout(() => {
                        setShowCount(false);
                        setCount(0);
                        setMessage('');
                    }, 3000);
                }, index)
        },
        {
            visible: permissions.includes('maintenance.resetPermissions'),
            title: '重置权限',
            desc: '恢复默认所有角色权限 - 不包括已设置的个人权限',
            btnTxt: '重置',
            btnIcon: <RestartAltRounded fontSize={'inherit'} />,
            helperText: '',
            onClick: (index) =>
                handleAction(
                    () => api.permission.reset({ adminId: user?.id }),
                    index
                )
        },
        {
            visible: permissions.includes('maintenance.resetMenus'),
            title: '重置角色菜单',
            desc: '恢复默认角色-菜单，以及关联的角色和菜单的显示 - 不包括已设置的个人菜单显示权限。',
            btnTxt: '重置',
            btnIcon: <RestartAltRounded fontSize={'inherit'} />,
            helperText: '',
            onClick: (index) =>
                handleAction(
                    () => api.roleMenu.resetRoleMneu({ adminId: user?.id }),
                    index
                )
        }
    ];

    return (
        <Box sx={{ p: 2 }}>
            <motion.div
                variants={containerVariants}
                initial={'hidden'}
                animate={'visible'}>
                <Grid
                    container
                    spacing={2}>
                    {appItems
                        .filter((item) => item.visible)
                        .map((item, index) => (
                            <Grid
                                size={{ xs: 12, sm: 6, md: 4 }}
                                key={index}>
                                <motion.div variants={itemVariants}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: '#fff',
                                            borderRadius: 2,
                                            transition: '0.6s ease',
                                            boxShadow:
                                                '0 2px 8px rgba(0,0,0,0.08)',
                                            '&:hover': {
                                                boxShadow:
                                                    '0 6px 24px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0,0,0,0.08)'
                                            }
                                        }}>
                                        <Typography
                                            variant={'h6'}
                                            gutterBottom>
                                            {item.title}
                                        </Typography>
                                        <Typography
                                            variant={'body2'}
                                            color={'text.secondary'}
                                            gutterBottom>
                                            {item.desc}
                                        </Typography>
                                        <Button
                                            variant={'contained'}
                                            startIcon={item.btnIcon}
                                            onClick={() => {
                                                setLoadingIndex(index);
                                                item.onClick(index);
                                            }}
                                            disabled={loadingIndex === index}>
                                            {loadingIndex === index ? (
                                                <CircularProgress size={18} />
                                            ) : (
                                                item.btnTxt
                                            )}
                                        </Button>
                                        <Typography
                                            variant={'body2'}
                                            mt={1}>
                                            {item.helperText}
                                        </Typography>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                </Grid>
            </motion.div>
        </Box>
    );
};

export default SettingMaintenancePage;
