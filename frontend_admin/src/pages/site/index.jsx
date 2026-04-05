import {
    Avatar,
    Box,
    Button,
    MenuItem,
    Select,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';
import ModalReset from './ModalReset';
import ModalBanner from './ModalBanner';
import { motion } from 'framer-motion';

// Animation variants
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
            duration: 0.5
        }
    }
};

const SettingSitePage = () => {
    const [siteData, setSiteData] = useState({});
    const [openReset, setOpenReset] = useState(false);
    const [openBanner, setOpenBanner] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const payload = {
                key: 'website',
                group: 'setting'
            };

            const res = await api.settings.get(payload);
            setSiteData(res.data);
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

    const onUpdate = async (data) => {
        try {
            const payload = {
                key: 'website',
                group: 'setting',
                value: JSON.stringify(data)
            };

            await api.settings.update(payload);
            loadData();
            enqueueSnackbar('已更新LOGO!', {
                variant: 'success'
            });
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

    const onDelete = async () => {
        try {
            const payload = {
                key: 'website',
                group: 'setting',
                value: JSON.stringify({
                    ...siteData,
                    logo: ''
                })
            };

            await api.settings.update(payload);
            loadData();
            enqueueSnackbar('已删除LOGO!', {
                variant: 'success'
            });
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
        <Box sx={{ p: 2 }}>
            <motion.div
                variants={containerVariants}
                initial={'hidden'}
                animate={'visible'}>
                <motion.div variants={itemVariants}>
                    <Box textAlign={'end'}>
                        <Button
                            variant={'contained'}
                            sx={{ mb: 2 }}
                            onClick={() => setOpenReset(true)}>
                            重置
                        </Button>
                    </Box>
                </motion.div>
                <motion.div variants={itemVariants}>
                    {siteData && Object.keys(siteData).length > 0 && (
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: '#fff',
                                borderRadius: 2,
                                boxShadow:
                                    '0 6px 24px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0,0,0,0.08)'
                            }}>
                            <Box
                                display={'flex'}
                                gap={1}
                                mb={2}>
                                <Typography
                                    fontSize={14}
                                    width={150}
                                    textAlign={'end'}>
                                    网站LOGO:
                                </Typography>
                                <Avatar
                                    variant={'rounded'}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        border: '1px solid #0000001a'
                                    }}
                                    src={`${
                                        import.meta.env.VITE_API_BASE_URL
                                    }/uploads/images/${siteData.logo}`}
                                />
                                <Box
                                    display={'flex'}
                                    flexDirection={'column'}
                                    gap={1}>
                                    <Button
                                        color={'success'}
                                        component={'label'}
                                        role={undefined}
                                        variant={'outlined'}
                                        tabIndex={-1}
                                        size={'small'}
                                        fullWidth
                                        sx={{ fontSize: 12 }}>
                                        更新
                                        <input
                                            type={'file'}
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (
                                                    !file &&
                                                    file instanceof File
                                                )
                                                    return;

                                                const imageData =
                                                    new FormData();
                                                imageData.append('file', file);

                                                const res =
                                                    await api.utilities.upload(
                                                        imageData
                                                    );
                                                onUpdate({
                                                    ...siteData,
                                                    logo: res.data.name
                                                });
                                            }}
                                            style={{
                                                clip: 'rect(0 0 0 0)',
                                                clipPath: 'inset(50%)',
                                                height: 1,
                                                overflow: 'hidden',
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                whiteSpace: 'nowrap',
                                                width: 1
                                            }}
                                        />
                                    </Button>
                                    <Button
                                        variant={'outlined'}
                                        color={'error'}
                                        size={'small'}
                                        sx={{ fontSize: 12 }}
                                        onClick={onDelete}>
                                        删除
                                    </Button>
                                </Box>
                            </Box>
                            <Box
                                display={'flex'}
                                gap={1}
                                mb={2}>
                                <Typography
                                    fontSize={14}
                                    width={150}
                                    textAlign={'end'}>
                                    首页横幅:
                                </Typography>
                                <Button
                                    variant={'outlined'}
                                    size={'small'}
                                    sx={{ fontSize: 12 }}
                                    onClick={() => setOpenBanner(true)}>
                                    查看
                                </Button>
                            </Box>
                            <Box
                                display={'flex'}
                                gap={1}
                                mb={2}>
                                <Typography
                                    fontSize={14}
                                    width={150}
                                    textAlign={'end'}>
                                    启用增值税:
                                </Typography>
                                <Box>
                                    <Typography
                                        fontSize={12}
                                        color={'textSecondary'}>
                                        关闭则增值税为0,
                                        权重高于“商品分类”中的税收开关。
                                    </Typography>
                                    <Select
                                        size={'small'}
                                        value={siteData.vatEnabled}
                                        sx={{ fontSize: 12 }}
                                        onChange={(e) =>
                                            onUpdate({
                                                ...siteData,
                                                vatEnabled: e.target.value
                                            })
                                        }>
                                        <MenuItem
                                            value={true}
                                            sx={{ fontSize: 12 }}>
                                            开启
                                        </MenuItem>
                                        <MenuItem
                                            value={false}
                                            sx={{ fontSize: 12 }}>
                                            关闭
                                        </MenuItem>
                                    </Select>
                                </Box>
                            </Box>
                            <Box
                                display={'flex'}
                                gap={1}
                                mb={2}>
                                <Typography
                                    fontSize={14}
                                    width={150}
                                    textAlign={'end'}>
                                    启用配送地址:
                                </Typography>
                                <Box>
                                    <Typography
                                        fontSize={12}
                                        color={'textSecondary'}>
                                        关闭则配送费为0, 不显示选择配送方式。
                                    </Typography>
                                    <Select
                                        size={'small'}
                                        value={siteData.deliveryFeeEnabled}
                                        sx={{ fontSize: 12 }}
                                        onChange={(e) =>
                                            onUpdate({
                                                ...siteData,
                                                deliveryFeeEnabled:
                                                    e.target.value
                                            })
                                        }>
                                        <MenuItem
                                            value={true}
                                            sx={{ fontSize: 12 }}>
                                            开启
                                        </MenuItem>
                                        <MenuItem
                                            value={false}
                                            sx={{ fontSize: 12 }}>
                                            关闭
                                        </MenuItem>
                                    </Select>
                                </Box>
                            </Box>
                            <Box
                                display={'flex'}
                                gap={1}
                                mb={2}>
                                <Typography
                                    fontSize={14}
                                    width={150}
                                    textAlign={'end'}>
                                    启用配送费:
                                </Typography>
                                <Box>
                                    <Typography
                                        fontSize={12}
                                        color={'textSecondary'}>
                                        关闭则地址为空, 不显示选择送货地址,
                                        无限制地区。
                                    </Typography>
                                    <Select
                                        size={'small'}
                                        value={siteData.deliveryAddressEnabled}
                                        sx={{ fontSize: 12 }}
                                        onChange={(e) =>
                                            onUpdate({
                                                ...siteData,
                                                deliveryAddressEnabled:
                                                    e.target.value
                                            })
                                        }>
                                        <MenuItem
                                            value={true}
                                            sx={{ fontSize: 12 }}>
                                            开启
                                        </MenuItem>
                                        <MenuItem
                                            value={false}
                                            sx={{ fontSize: 12 }}>
                                            关闭
                                        </MenuItem>
                                    </Select>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </motion.div>
            </motion.div>
            <ModalReset
                open={openReset}
                setOpen={setOpenReset}
                loadData={loadData}
            />
            <ModalBanner
                open={openBanner}
                setOpen={setOpenBanner}
                data={siteData}
                loadData={loadData}
            />
        </Box>
    );
};

export default SettingSitePage;
