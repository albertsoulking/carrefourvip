import {
    RefreshRounded,
    SearchRounded,
    ExpandLessRounded
} from '@mui/icons-material';
import {
    TextField,
    Button,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Grid,
    Paper,
    Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useState } from 'react';
import { useTranslation } from '../../../node_modules/react-i18next';
import ButtonRecycle from './ButtonRecycle';
import ButtonAdd from './ButtonAdd';

const ActionBarExpand = ({
    onSearch,
    searchModal,
    setPaginationModel,
    adminsData,
    setIsExpand
}) => {
    const items = [
        { name: 'adminId', label: '代理ID', type: 'number' },
        { name: 'name', label: '名称' },
        { name: 'email', label: '邮箱' },
        { name: 'remark', label: '备注' },
        { name: 'referralCode', label: '邀请码' },
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
        {
            name: 'status',
            label: '账号状态',
            children: [
                {
                    label: '启用',
                    value: 1
                },
                {
                    label: '禁用',
                    value: 2
                }
            ]
        },
        {
            name: 'parentId',
            label: '上级（管理员）',
            children: adminsData
                ? adminsData.map((t) => ({
                      label: `${t.name} (${t.referralCode})`,
                      value: t.id
                  }))
                : []
        }
    ];

    const { t } = useTranslation();
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [formData, setFormData] = useState({});

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => {
            const updated = { ...prev };

            if (value === '') delete updated[name]; // 移除字段
            else updated[name] = value; // 设置新值

            return updated;
        });
    };

    const handleSearch = () => {
        onSearch({
            ...searchModal,
            ...formData,
            fromDate,
            toDate
        });
    };

    const handleReset = () => {
        setFormData({});
        setFromDate(null);
        setToDate(null);
        onSearch({
            page: 1,
            limit: 10,
            orderBy: 'desc',
            sortBy: 'id'
        });
        setPaginationModel({ page: 0, pageSize: 10 });
    };

    return (
        <Paper
            sx={{
                p: { xs: 1, sm: 2 },
                mb: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderRadius: 2,
                gap: { xs: 2, sm: 0 }
            }}>
            <Grid
                container
                spacing={2}>
                {items.map((item) => (
                    <Grid
                        size={{ xs: 12, sm: 4, md: 2 }}
                        key={item.name}>
                        {item.children ? (
                            <FormControl
                                fullWidth
                                size={'small'}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: 34.25
                                    }
                                }}>
                                <InputLabel sx={{ fontSize: 12 }}>
                                    {item.label}
                                </InputLabel>
                                <Select
                                    {...item}
                                    value={formData[item.name] || ''}
                                    onChange={handleInputChange}
                                    sx={{ fontSize: 12 }}>
                                    <MenuItem
                                        value={''}
                                        key={0}
                                        sx={{ fontSize: 12 }}>
                                        全部
                                    </MenuItem>
                                    {item.children.map((child) => (
                                        <MenuItem
                                            value={child.value}
                                            key={child.value}
                                            sx={{ fontSize: 12 }}>
                                            {child.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <TextField
                                {...item}
                                fullWidth
                                size={'small'}
                                value={formData[item.name] || ''}
                                onChange={handleInputChange}
                                InputProps={{
                                    sx: {
                                        fontSize: 12
                                    }
                                }}
                                InputLabelProps={{
                                    sx: {
                                        fontSize: 12
                                    }
                                }}
                            />
                        )}
                    </Grid>
                ))}
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <DatePicker
                        name={'fromDate'}
                        label={'起始日期'}
                        value={fromDate}
                        onChange={(date) => setFromDate(date)}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: 'small',
                                InputProps: {
                                    sx: {
                                        fontSize: 12
                                    }
                                },
                                InputLabelProps: {
                                    sx: {
                                        fontSize: 12
                                    }
                                }
                            }
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <DatePicker
                        name={'toDate'}
                        label={'结束日期'}
                        value={toDate}
                        onChange={(date) => setToDate(date)}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: 'small',
                                InputProps: {
                                    sx: {
                                        fontSize: 12
                                    }
                                },
                                InputLabelProps: {
                                    sx: {
                                        fontSize: 12
                                    }
                                }
                            }
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Box
                        display={'flex'}
                        justifyContent={'space-between'}>
                        <Box display={'flex'}>
                            <Button
                                variant={'contained'}
                                onClick={handleSearch}
                                startIcon={
                                    <SearchRounded fontSize={'inherit'} />
                                }
                                size={'small'}
                                sx={{
                                    mr: 2,
                                    fontSize: 12,
                                    textTransform: 'capitalize'
                                }}>
                                {t('actionBar.search')}
                            </Button>
                            <Button
                                variant={'outlined'}
                                onClick={handleReset}
                                startIcon={
                                    <RefreshRounded fontSize={'inherit'} />
                                }
                                size={'small'}
                                sx={{
                                    mr: 2,
                                    fontSize: 12,
                                    textTransform: 'capitalize'
                                }}>
                                {t('actionBar.refresh')}
                            </Button>
                            <Button
                                startIcon={<ExpandLessRounded />}
                                size={'small'}
                                sx={{
                                    fontSize: 12,
                                    textTransform: 'capitalize'
                                }}
                                onClick={() => setIsExpand(false)}>
                                {t('actionBar.collapse')}
                            </Button>
                        </Box>
                        <Box display={'flex'}>
                          <ButtonRecycle />
                          <ButtonAdd />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default ActionBarExpand;
