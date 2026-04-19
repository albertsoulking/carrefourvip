import {
    ExpandLessRounded,
    RefreshRounded,
    SearchRounded
} from '@mui/icons-material';
import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { actionBarPaperSx } from '../_shared/actionBarStyles';

const STATUS_OPTIONS = [
    { label: '已提交', value: 'submitted' },
    { label: '处理中', value: 'processing' },
    { label: '已确认', value: 'confirmed' },
    { label: '已取消', value: 'cancelled' }
];

const ActionBarExpand = ({
    onSearch,
    searchModal,
    setPaginationModel,
    setIsExpand
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({});
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const items = [
        { name: 'bookingReference', label: '预订编号' },
        { name: 'contactName', label: '联系人' },
        { name: 'contactEmail', label: '联系邮箱' },
        { name: 'airlineCode', label: '航司代码' },
        { name: 'originCode', label: '出发机场' },
        { name: 'destinationCode', label: '到达机场' },
        {
            name: 'status',
            label: '状态',
            children: STATUS_OPTIONS
        }
    ];

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => {
            const updated = { ...prev };

            if (value === '') delete updated[name];
            else updated[name] = value;

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
        setPaginationModel({ page: 0, pageSize: searchModal.limit });
    };

    const handleReset = () => {
        setFormData({});
        setFromDate(null);
        setToDate(null);
        onSearch({
            page: 1,
            limit: 10,
            orderBy: 'desc',
            sortBy: 'createdAt'
        });
        setPaginationModel({ page: 0, pageSize: 10 });
    };

    return (
        <Paper sx={actionBarPaperSx}>
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
                                size='small'
                                sx={{
                                    '& .MuiInputBase-root': {
                                        height: 34.25
                                    }
                                }}>
                                <InputLabel sx={{ fontSize: 12 }}>
                                    {item.label}
                                </InputLabel>
                                <Select
                                    name={item.name}
                                    label={item.label}
                                    value={formData[item.name] || ''}
                                    onChange={handleInputChange}
                                    sx={{ fontSize: 12 }}>
                                    <MenuItem
                                        value=''
                                        sx={{ fontSize: 12 }}>
                                        全部
                                    </MenuItem>
                                    {item.children.map((child) => (
                                        <MenuItem
                                            key={child.value}
                                            value={child.value}
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
                                size='small'
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
                        label='开始日期'
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
                        label='结束日期'
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
                    <Box className='action-bar-actions-row'>
                        <Box className='action-bar-actions-group'>
                            <Button
                                variant='contained'
                                onClick={handleSearch}
                                startIcon={<SearchRounded fontSize='inherit' />}
                                size='small'
                                sx={{
                                    mr: 2,
                                    fontSize: 12,
                                    textTransform: 'capitalize'
                                }}>
                                {t('actionBar.search')}
                            </Button>
                            <Button
                                variant='outlined'
                                onClick={handleReset}
                                startIcon={<RefreshRounded fontSize='inherit' />}
                                size='small'
                                sx={{
                                    mr: 2,
                                    fontSize: 12,
                                    textTransform: 'capitalize'
                                }}>
                                {t('actionBar.refresh')}
                            </Button>
                            <Button
                                startIcon={<ExpandLessRounded fontSize='inherit' />}
                                size='small'
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
