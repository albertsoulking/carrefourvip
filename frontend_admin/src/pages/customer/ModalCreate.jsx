import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    Divider,
    DialogContent,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    DialogActions,
    Button,
    Grid
} from '@mui/material';
import { PersonRounded } from '@mui/icons-material';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

export default function ModalCreate({ open, setOpen }) {
    const [teamsData, setTeamsData] = useState([]);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (userInfo.role.name === 'team' || userInfo.role.name === 'head')
            return;

        const res = await api.agent.getAdmins({ roleName: 'team' });
        setTeamsData(res.data);
    };

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
            name: 'phone',
            label: '电话'
        },
        {
            name: 'password',
            label: '密码'
        },
        {
            name: 'referralCode',
            label: '员工邀请码 *',
            children: teamsData
                ? teamsData.map((t) => ({
                      label: `${t.name} (${t.referralCode})`,
                      value: t.referralCode
                  }))
                : []
        },
        {
            name: 'mode',
            label: '账号类型 *',
            children: [
                {
                    label: '正式',
                    value: 'live'
                },
                {
                    label: '试玩',
                    value: 'test'
                }
            ]
        }
    ];

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value ?? ''
        });
    };

    const handleOnClose = () => {
        setOpen(false);
        setFormData({});
    };

    // Handle create user submission
    const handleCreateSubmit = async () => {
        const payload = {
            ...formData,
            username: formData.email
        };

        try {
            await api.user.create(payload);
            setOpen(false);
            setFormData({});
            enqueueSnackbar('创建成功!', {
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
            onClose={handleOnClose}
            maxWidth={'sm'}
            fullWidth
            container={document.body}
            disablePortal={false}
            aria-labelledby='create-user-dialog-title'
            PaperProps={{
                sx: {
                    borderTop: '6px solid',
                    borderTopColor: 'primary.main',
                    borderRadius: '12px'
                }
            }}>
            <DialogTitle
                id='create-user-dialog-title'
                sx={{
                    pb: 1,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiSvgIcon-root': { mr: 1 }
                }}>
                <PersonRounded color='primary' /> 创建客户
            </DialogTitle>
            <Divider />
            <DialogContent>
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
            <Divider />
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
