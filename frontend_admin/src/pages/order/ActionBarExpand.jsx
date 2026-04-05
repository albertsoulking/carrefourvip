import {
    ExpandLessRounded,
    RefreshRounded,
    SearchRounded
} from '@mui/icons-material';
import {
    Paper,
    Box,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button
} from '@mui/material';
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { useTranslation } from '../../../node_modules/react-i18next';
import ButtonRecycle from './ButtonRecycle';
import ButtonAdd from './ButtonAdd';

const ActionBarExpand = ({
    searchModal,
    teamsData,
    onSearch,
    setPaginationModel,
    setIsExpand
}) => {
    const { t } = useTranslation();
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [formData, setFormData] = useState({});

    const items = [
        { name: 'orderId', label: 'table.orderId', type: 'number' },
        { name: 'email', label: 'table.email' },
        {
            name: 'parentId',
            label: 'parent.name',
            children: teamsData
                ? teamsData.map((t) => ({
                      label: `${t.name} (${t.referralCode})`,
                      value: t.id
                  }))
                : []
        },
        {
            name: 'mode',
            label: 'table.mode',
            children: [
                {
                    label: 'table.live',
                    value: 'live'
                },
                {
                    label: 'table.test',
                    value: 'test'
                }
            ]
        },
        {
            name: 'balanceLessThan',
            label: 'table.balanceLessThan',
            type: 'number'
        },
        {
            name: 'balanceGreaterThan',
            label: 'table.balanceGreaterThan',
            type: 'number'
        },
        {
            name: 'deliveryMethod',
            label: 'table.deliveryMethod',
            children: [
                {
                    label: 'table.standard',
                    value: 'standard'
                },
                {
                    label: 'table.express',
                    value: 'express'
                }
            ]
        },
        {
            name: 'payMethod',
            label: 'table.payMethod',
            children: [
                {
                    label: 'table.balance',
                    value: 'balance'
                },
                {
                    label: 'table.paypal',
                    value: 'paypal'
                },
                {
                    label: 'table.stripe',
                    value: 'stripe'
                },
                {
                    label: 'table.hybrid',
                    value: 'hybrid'
                },
                {
                    label: 'table.card',
                    value: 'card'
                },
                {
                    label: 'table.pay2s',
                    value: 'pay2s'
                },
                {
                    label: 'table.lemon',
                    value: 'lemon'
                },
                {
                    label: 'table.behalf',
                    value: 'behalf'
                },
                {
                    label: 'table.starpay',
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
            label: 'table.status.order',
            children: [
                {
                    label: 'table.pending',
                    value: 'pending'
                },
                {
                    label: 'table.processing',
                    value: 'processing'
                },
                {
                    label: 'table.shipped',
                    value: 'shipped'
                },
                {
                    label: 'table.delivered',
                    value: 'delivered'
                },
                {
                    label: 'table.cancelled',
                    value: 'cancelled'
                },
                {
                    label: 'table.refunded',
                    value: 'refunded'
                }
            ]
        },
        {
            name: 'paymentStatus',
            label: 'table.paymentStatus',
            children: [
                {
                    label: 'table.pending',
                    value: 'pending'
                },
                {
                    label: 'table.paid',
                    value: 'paid'
                },
                {
                    label: 'table.cancelled',
                    value: 'cancelled'
                },
                {
                    label: 'table.refunded',
                    value: 'refunded'
                }
            ]
        }
    ];

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
            page: 1,
            limit: searchModal.limit,
            orderBy: searchModal.orderBy,
            sortBy: searchModal.sortBy,
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
                                    {t(item.label)}
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
                                        {t('actionBar.all')}
                                    </MenuItem>
                                    {item.children.map((child) => (
                                        <MenuItem
                                            value={child.value}
                                            key={child.value}
                                            sx={{ fontSize: 12 }}>
                                            {t(child.label)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <TextField
                                {...item}
                                label={t(item.label)}
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
                        label={t('table.startDate')}
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
                        label={t('table.endDate')}
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
