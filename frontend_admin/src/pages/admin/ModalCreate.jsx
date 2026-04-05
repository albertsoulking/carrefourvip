import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@mui/material';
import { PersonRounded } from '@mui/icons-material';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

export default function ModalCreate({
    open,
    setOpen
}) {
    const [formData, setFormData] = useState({});
    const [adminsData, setAdminsData] = useState([]);

    const items = [
        {
            name: 'name',
            label: '名称'
        },
        {
            name: 'email',
            label: '账号'
        },
        {
            name: 'password',
            label: '密码'
        },
        {
            name: 'referralCode',
            label: '管理员邀请码 *',
            children: adminsData
                ? adminsData.map((t) => ({
                      label: `${t.name} (${t.referralCode})`,
                      value: t.referralCode
                  }))
                : []
        },
        {
            name: 'roleName',
            label: '角色',
            children: [
                {
                    label: '管理员',
                    value: 'admin'
                },
                {
                    label: '代理',
                    value: 'agent'
                },
                {
                    label: '团长',
                    value: 'head'
                },
                {
                    label: '组员',
                    value: 'team'
                },
                {
                    label: '客服',
                    value: 'support'
                }
            ]
        },
    ];

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        const res = await api.agent.getAdmins({ roleName: 'admin' });
        setAdminsData(res.data);
    };

    const handleOnClose = () => {
        setOpen(false);
        setFormData({});
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value ?? ''
        });
    };

    // Handle create agent submission
    const handleCreateSubmit = async () => {
        try {
            await api.agent.createAdmin(formData);
            setOpen(false);
            setFormData({});
            enqueueSnackbar('创建管理员成功!', {
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
        <Dialog
            open={open}
            maxWidth={'sm'}
            fullWidth
            container={document.body}
            disablePortal={false}>
            <DialogTitle
                sx={{
                    pb: 1,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiSvgIcon-root': { mr: 1 }
                }}>
                <PersonRounded color={'primary'} /> 添加新管理员
            </DialogTitle>
            <DialogContent dividers>
                {items.map((item) => (
                    <Grid
                        size={{ xs: 12 }}
                        key={item.name}>
                        {item.children ? (
                            <FormControl
                                margin={'normal'}
                                fullWidth>
                                <InputLabel>{item.label}</InputLabel>
                                <Select
                                    {...item}
                                    value={formData[item.name] || ''}
                                    onChange={handleInputChange}>
                                    <MenuItem
                                        value={''}
                                        key={0}>
                                        全部
                                    </MenuItem>
                                    {item.children.map((child) => (
                                        <MenuItem
                                            value={child.value}
                                            key={child.value}>
                                            {child.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <TextField
                                {...item}
                                value={formData[item.name] || ''}
                                onChange={handleInputChange}
                                fullWidth
                                required
                                margin={'normal'}
                            />
                        )}
                    </Grid>
                ))}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={handleOnClose}
                    variant={'outlined'}
                    color={'error'}
                    sx={{ width: 100 }}>
                    取消
                </Button>
                <Button
                    onClick={handleCreateSubmit}
                    variant={'contained'}
                    color={'primary'}
                    sx={{ width: 100 }}>
                    创建
                </Button>
            </DialogActions>
        </Dialog>
    );
}
