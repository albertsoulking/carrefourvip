import {
    AddRounded,
    DeleteRounded,
    ExpandLessRounded,
    RefreshRounded,
    SearchRounded
} from '@mui/icons-material';
import {
    Paper,
    Box,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useState } from 'react';
import web from '../../routes/web';
import useSmartNavigate from '../../hooks/useSmartNavigate';
import { useTranslation } from '../../../node_modules/react-i18next';

const ActionBarExpand = ({
    setOpen,
    onSearch,
    permissions,
    searchModal,
    setPaginationModel,
    setIsExpand
}) => {
    const items = [
        { name: 'paymentId', label: '支付ID', type: 'number' },
        { name: 'name', label: '名称' },
        { name: 'description', label: '描述' },
        {
            name: 'isActive',
            label: '状态',
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
    ];

    const { t } = useTranslation();
    const navigate = useSmartNavigate();
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
                                sx={{ mr: 2, fontSize: 12, textTransform: 'capitalize' }}
                                size={'small'}>
                                {t('actionBar.search')}
                            </Button>
                            <Button
                                variant={'outlined'}
                                onClick={handleReset}
                                startIcon={
                                    <RefreshRounded fontSize={'inherit'} />
                                }
                                size={'small'}
                                sx={{ mr: 2, fontSize: 12, textTransform: 'capitalize' }}>
                                {t('actionBar.refresh')}
                            </Button>
                            <Button
                                startIcon={<ExpandLessRounded fontSize={'inherit'} />}
                                size={'small'}
                                sx={{ fontSize: 12, textTransform: 'capitalize' }}
                                onClick={() => setIsExpand(false)}>
                                {t('actionBar.collapse')}
                            </Button>
                        </Box>
                        <Box display={'flex'}>
                            <Button
                                color={'error'}
                                variant={'outlined'}
                                onClick={() =>
                                    navigate(web.product.categoryDelete)
                                }
                                startIcon={
                                    <DeleteRounded fontSize={'inherit'} />
                                }
                                size={'small'}
                                sx={{ mr: 2, fontSize: 12, textTransform: 'capitalize' }}>
                                {t('actionBar.recycle')}
                            </Button>
                            {permissions.includes('category.add') && (
                                <Button
                                    variant={'contained'}
                                    startIcon={
                                        <AddRounded fontSize={'inherit'} />
                                    }
                                    onClick={() => setOpen(true)}
                                    sx={{ ml: 'auto', fontSize: 12, textTransform: 'capitalize' }}
                                    size={'small'}>
                                    添加分类
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default ActionBarExpand;
