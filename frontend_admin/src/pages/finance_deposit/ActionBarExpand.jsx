import {
    ExpandLessRounded,
    RefreshRounded,
    SearchRounded
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
import { useTranslation } from 'react-i18next';
import { actionBarPaperSx } from '../_shared/actionBarStyles';

const ActionBarExpand = ({
    onSearch,
    searchModal,
    teamsData,
    setPaginationModel,
    setIsExpand
}) => {
    const items = [
        { name: 'transactionId', label: '交易ID', type: 'number' },
        { name: 'email', label: '邮箱' },
        {
            name: 'mode',
            label: '账号类型',
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
        },
        {
            name: 'parentId',
            label: '上级（员工）',
            children: teamsData
                ? teamsData.map((t) => ({
                      label: `${t.name} (${t.referralCode})`,
                      value: t.id
                  }))
                : []
        },
        { name: 'balanceLessThan', label: '余额小于', type: 'number' },
        { name: 'balanceGreaterThan', label: '余额大于', type: 'number' },
        {
            name: 'direction',
            label: '方向',
            children: [
                {
                    label: '进',
                    value: 'in'
                },
                {
                    label: '出',
                    value: 'out'
                }
            ]
        },
        {
            name: 'method',
            label: '方式',
            children: [
                {
                    label: '余额支付',
                    value: 'balance'
                },
                {
                    label: 'PayPal支付',
                    value: 'paypal'
                },
                {
                    label: 'Stripe支付',
                    value: 'stripe'
                },
                {
                    label: '混合支付',
                    value: 'hybrid'
                },
                {
                    label: '银行卡支付',
                    value: 'card'
                },
                {
                    label: 'Pay2s支付',
                    value: 'pay2s'
                },
                {
                    label: 'Lemon支付',
                    value: 'lemon'
                },
                {
                    label: '代付款',
                    value: 'behalf'
                },
                {
                    label: 'Star支付',
                    value: 'starpay'
                },
                {
                    label: 'table.faf',
                    value: 'faf'
                },
                {
                    label: 'table.wise',
                    value: 'wise'
                }
            ]
        },
        {
            name: 'status',
            label: '状态',
            children: [
                {
                    label: '等待中',
                    value: 'pending'
                },
                {
                    label: '已完成',
                    value: 'completed'
                },
                {
                    label: '已取消',
                    value: 'cancelled'
                },
                {
                    label: '已退款',
                    value: 'refunded'
                }
            ]
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
            ...formData,
            page: searchModal.page,
            limit: searchModal.limit,
            orderBy: searchModal.orderBy,
            sortBy: searchModal.sortBy,
            fromDate,
            toDate,
            type: 'deposit'
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
            sortBy: 'id',
            type: 'deposit'
        });
        setPaginationModel({ page: 0, pageSize: 10 });
    };

    return (
        <Paper
            sx={actionBarPaperSx}>
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
                    <Box className={'action-bar-actions-row'}>
                        <Box className={'action-bar-actions-group'}>
                            <Button
                                variant={'contained'}
                                onClick={handleSearch}
                                startIcon={
                                    <SearchRounded fontSize={'inherit'} />
                                }
                                fullWidth
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
                                fullWidth
                                size={'small'}
                                sx={{
                                    mr: 2,
                                    fontSize: 12,
                                    textTransform: 'capitalize'
                                }}>
                                {t('actionBar.refresh')}
                            </Button>
                            <Button
                                startIcon={
                                    <ExpandLessRounded fontSize={'inherit'} />
                                }
                                size={'small'}
                                sx={{
                                    fontSize: 12,
                                    textTransform: 'capitalize'
                                }}
                                onClick={() => setIsExpand(false)}>
                                {t('actionBar.collapse')}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default ActionBarExpand;
