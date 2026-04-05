import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import { PersonRounded } from '@mui/icons-material';
import usePermissionStore from '../../hooks/usePermissionStore';
import { enqueueSnackbar } from 'notistack';
import dayjs from 'dayjs';

export default function ModalDetail({ open, data, setOpen }) {
    const permissions = usePermissionStore((state) => state.permissions);
    const [openImageViewer, setOpenImageViewer] = useState(false);
    const [formData, setFormData] = useState({});
    const [adminData, setAdminData] = useState([]);

    useEffect(() => {
        if (!open) return;
        setFormData(data ? { ...data, parentId: data.parent?.id || '' } : {});
        getAdmins();
    }, [open, data]);

    const getAdmins = async () => {
        const res = await api.agent.getAdmins();
        setAdminData(res.data);
    };

    const handleOnSave = async () => {
        const payload = {
            id: formData?.id,
            name: formData?.name,
            email: formData?.email,
            phone: formData?.phone,
            mode: formData?.mode,
            balance: formData?.balance,
            point: formData?.point,
            remark: formData?.remark,
            status: formData?.status,
            parentId: formData?.parentId
        };

        try {
            await api.user.update(payload);
            enqueueSnackbar('已保存更改!', {
                variant: 'success'
            });

            setOpen(false);
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

    const handleOnChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value || ''
        });
    };

    return (
        <Dialog
            open={open}
            maxWidth={'md'}
            fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonRounded color={'primary'} /> 客户详情
            </DialogTitle>
            <DialogContent dividers>
                <Box
                    display={'flex'}
                    gap={2}>
                    <Avatar
                        src={
                            formData.avatar
                                ? `${
                                      import.meta.env.VITE_API_BASE_URL
                                  }/uploads/thumbs/${formData.avatar}`
                                : ''
                        }
                        variant={'rounded'}
                        sx={{ width: 120, height: 120 }}
                        onClick={() => setOpenImageViewer(true)}
                    />

                    <Box
                        display={'flex'}
                        flexDirection={'column'}
                        gap={2}>
                        <TextField
                            name={'id'}
                            label={'会员ID'}
                            value={formData.id || ''}
                            size={'small'}
                            disabled
                        />
                        <TextField
                            name={'name'}
                            label={'姓名'}
                            value={formData.name || ''}
                            size={'small'}
                            onChange={(e) =>
                                handleOnChange('name', e.target.value)
                            }
                        />
                        <TextField
                            name={'email'}
                            label={'邮箱'}
                            value={formData.email || ''}
                            size={'small'}
                            onChange={(e) =>
                                handleOnChange('email', e.target.value)
                            }
                        />
                        <TextField
                            name={'phone'}
                            label={'手机'}
                            value={formData.phone || ''}
                            size={'small'}
                            onChange={(e) =>
                                handleOnChange('phone', e.target.value)
                            }
                        />
                        <FormControl fullWidth>
                            <InputLabel>类型</InputLabel>
                            <Select
                                name={'mode'}
                                label={'类型'}
                                size={'small'}
                                value={formData.mode || ''}
                                onChange={(e) =>
                                    handleOnChange('mode', e.target.value)
                                }>
                                <MenuItem value={'live'}>正式</MenuItem>
                                <MenuItem value={'test'}>试玩</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ flexGrow: 0.5 }} />
                    <Box
                        display={'flex'}
                        flexDirection={'column'}
                        gap={2}>
                        <TextField
                            name={'balance'}
                            label={'余额 (€)'}
                            value={formData.balance || ''}
                            size={'small'}
                            onChange={(e) =>
                                handleOnChange('balance', e.target.value)
                            }
                        />
                        <TextField
                            name={'point'}
                            label={'积分'}
                            value={formData.point || ''}
                            size={'small'}
                            onChange={(e) =>
                                handleOnChange('point', e.target.value)
                            }
                        />
                        <TextField
                            name={'remark'}
                            label={'备注'}
                            value={formData.remark || ''}
                            size={'small'}
                            onChange={(e) =>
                                handleOnChange('remark', e.target.value)
                            }
                        />
                        <FormControl fullWidth>
                            <InputLabel>状态</InputLabel>
                            <Select
                                name={'status'}
                                label={'状态'}
                                size={'small'}
                                value={formData.status || ''}
                                onChange={(e) =>
                                    handleOnChange('status', e.target.value)
                                }>
                                <MenuItem value={true}>正常</MenuItem>
                                <MenuItem value={false}>封禁</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <FormControl fullWidth>
                    <InputLabel>上级</InputLabel>
                    <Select
                        name={'parentId'}
                        label={'上级'}
                        size={'small'}
                        value={
                            adminData.length > 0 &&
                            adminData.some((a) => a.id === formData.parentId)
                                ? formData.parentId
                                : ''
                        }
                        onChange={(e) =>
                            handleOnChange('parentId', e.target.value)
                        }>
                        {adminData.map((admin) => (
                            <MenuItem
                                key={admin.id}
                                value={admin.id}>
                                {admin.name} ({admin.role.name})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Divider sx={{ my: 2 }} />
                <Box>
                    <Box
                        display={'flex'}
                        gap={1}>
                        <Typography>注册IP:</Typography>
                        <Typography>{data?.ip}</Typography>
                    </Box>
                    <Box
                        display={'flex'}
                        gap={1}>
                        <Typography>最近登录IP:</Typography>
                        <Box flexGrow={1}></Box>
                        <Typography>{data?.loginIp}</Typography>
                    </Box>
                    <Box
                        display={'flex'}
                        gap={1}>
                        <Typography>最近登录时间:</Typography>
                        <Typography>{dayjs(data?.lastLoginAt).format(
                                'YYYY-MM-DD HH:mm:ss'
                            )}</Typography>
                    </Box>
                    <Box
                        display={'flex'}
                        gap={1}>
                        <Typography>最近更新时间:</Typography>
                        <Typography>
                            {dayjs(data?.updatedAt).format(
                                'YYYY-MM-DD HH:mm:ss'
                            )}
                        </Typography>
                    </Box>
                    <Box
                        display={'flex'}
                        gap={1}>
                        <Typography>注册时间:</Typography>
                        <Typography>
                            {dayjs(data?.createdAt).format(
                                'YYYY-MM-DD HH:mm:ss'
                            )}
                        </Typography>
                    </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box>
                    <Box display={'flex'}>
                        <Typography>城市：</Typography>
                        <Typography>{data?.city}</Typography>
                    </Box>
                    <Box display={'flex'}>
                        <Typography>邮编：</Typography>
                        <Typography>{data?.zipCode}</Typography>
                    </Box>
                    <Box display={'flex'}>
                        <Typography>省/地区：</Typography>
                        <Typography>{data?.state}</Typography>
                    </Box>
                    <Box display={'flex'}>
                        <Typography>国家：</Typography>
                        <Typography>{data?.country}</Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    sx={{ ml: 1 }}
                    onClick={() => setOpen(false)}
                    variant={'outlined'}
                    color={'action'}>
                    关闭
                </Button>
                {permissions.includes('customer.edit') && (
                    <Button
                        onClick={handleOnSave}
                        variant={'contained'}
                        sx={{ width: 100 }}>
                        保存更改
                    </Button>
                )}
            </DialogActions>
            <Dialog
                open={openImageViewer}
                onClose={() => setOpenImageViewer(false)}>
                <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/uploads/images/${
                        formData.avatar
                    }`}
                    alt={formData.avatar}
                    style={{ objectFit: 'contain', borderRadius: 4 }}
                    onClick={() => setOpenImageViewer(false)}
                />
            </Dialog>
        </Dialog>
    );
}
