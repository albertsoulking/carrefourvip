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
import { useTranslation } from '../../../node_modules/react-i18next';

const ActionBarExpand = ({
    onSearch,
    searchModal,
    teamsData,
    setPaginationModel,
    setIsExpand
}) => {
    const { t } = useTranslation();
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [formData, setFormData] = useState({});

    const items = [
        { name: 'userId', label: t('table.userId'), type: 'number' },
        { name: 'name', label: t('table.name') },
        { name: 'email', label: t('table.email') },
        { name: 'remark', label: t('table.remark') },
        {
            name: 'mode',
            label: t('table.mode'),
            children: [
                {
                    label: t('table.live'),
                    value: 'live'
                },
                {
                    label: t('table.test'),
                    value: 'test'
                }
            ]
        },
        {
            name: 'type',
            label: 'table.loginType',
            children: [
                {
                    label: 'table.login',
                    value: 'login'
                },
                {
                    label: 'table.logout',
                    value: 'logout'
                }
            ]
        },
        {
            name: 'parentId',
            label: 'parent.name',
            children: teamsData
                ? teamsData.map((t) => ({
                      label: `${t.name} (${t.referralCode})`,
                      value: t.id
                  }))
                : []
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
            sortBy: 'id',
            userType: 'user',
            roleType: 'customer'
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
                                        全部
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
                                fullWidth
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
