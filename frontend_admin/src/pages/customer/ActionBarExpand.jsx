import { RefreshRounded, SearchRounded } from '@mui/icons-material';
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
import ButtonRecycle from './ButtonRecycle';
import ButtonAdd from './ButtonAdd';
import { useTranslation } from 'react-i18next';
import { actionBarPaperSx } from '../_shared/actionBarStyles';
import {
    ACTION_BAR_ACTIONS_GRID,
    ACTION_BAR_DATE_GRID,
    ACTION_BAR_FIELD_GRID,
    buildSearchPayload,
    submitOnEnter
} from '../_shared/actionBarSearchHelpers';

const fieldControlSx = {
    '& .MuiInputBase-root': { minHeight: 40 }
};

const ActionBarExpand = ({
    onSearch,
    searchModal,
    teamsData,
    setPaginationModel
}) => {
    const items = [
        { name: 'userId', label: 'table.userId', type: 'number' },
        { name: 'name', label: 'table.name' },
        { name: 'email', label: 'table.email' },
        { name: 'phone', label: 'table.phone' },
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
        { name: 'remark', label: 'table.remark' },
        {
            name: 'status',
            label: 'table.status.order',
            children: [
                { label: '启用', value: 1 },
                { label: '禁用', value: 2 }
            ]
        },
        {
            name: 'mode',
            label: 'table.mode',
            children: [
                { label: '正式', value: 'live' },
                { label: '试玩', value: 'test' }
            ]
        },
        {
            name: 'parentId',
            label: 'parent.name',
            children: teamsData
                ? teamsData.map((tm) => ({
                      label: `${tm.name} (${tm.referralCode})`,
                      value: tm.id
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
            if (value === '') delete updated[name];
            else updated[name] = value;
            return updated;
        });
    };

    const handleSearch = () => {
        onSearch(
            buildSearchPayload(searchModal, formData, items, {
                fromDate,
                toDate
            })
        );
    };

    const handleReset = () => {
        setFormData({});
        setFromDate(null);
        setToDate(null);
        onSearch({
            page: 1,
            limit: searchModal?.limit ?? 10,
            orderBy: searchModal?.orderBy ?? 'desc',
            sortBy: searchModal?.sortBy ?? 'id'
        });
        setPaginationModel({
            page: 0,
            pageSize: searchModal?.limit ?? 10
        });
    };

    const onFieldKeyDown = submitOnEnter(handleSearch);

    return (
        <Paper sx={actionBarPaperSx}>
            <Grid
                container
                spacing={2}
                width={'100%'}>
                {items.map((item) => (
                    <Grid
                        size={ACTION_BAR_FIELD_GRID}
                        key={item.name}>
                        {item.children ? (
                            <FormControl
                                fullWidth
                                size={'small'}
                                sx={fieldControlSx}>
                                <InputLabel sx={{ fontSize: 12 }}>
                                    {t(item.label)}
                                </InputLabel>
                                <Select
                                    {...item}
                                    value={formData[item.name] ?? ''}
                                    onChange={handleInputChange}
                                    sx={{ fontSize: 12 }}>
                                    <MenuItem
                                        value={''}
                                        sx={{ fontSize: 12 }}>
                                        全部
                                    </MenuItem>
                                    {item.children.map((child) => (
                                        <MenuItem
                                            value={child.value}
                                            key={String(child.value)}
                                            sx={{ fontSize: 12 }}>
                                            {typeof child.label === 'string' &&
                                            child.label.startsWith('table.')
                                                ? t(child.label)
                                                : child.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <TextField
                                {...item}
                                name={item.name}
                                label={t(item.label)}
                                fullWidth
                                size={'small'}
                                value={formData[item.name] || ''}
                                onChange={handleInputChange}
                                onKeyDown={onFieldKeyDown}
                                InputProps={{ sx: { fontSize: 12 } }}
                                InputLabelProps={{ sx: { fontSize: 12 } }}
                            />
                        )}
                    </Grid>
                ))}
                <Grid size={ACTION_BAR_DATE_GRID}>
                    <DatePicker
                        label={t('table.startDate')}
                        value={fromDate}
                        onChange={(date) => setFromDate(date)}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: 'small',
                                onKeyDown: onFieldKeyDown,
                                InputProps: { sx: { fontSize: 12 } },
                                InputLabelProps: { sx: { fontSize: 12 } }
                            }
                        }}
                    />
                </Grid>
                <Grid size={ACTION_BAR_DATE_GRID}>
                    <DatePicker
                        label={t('table.endDate')}
                        value={toDate}
                        onChange={(date) => setToDate(date)}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: 'small',
                                onKeyDown: onFieldKeyDown,
                                InputProps: { sx: { fontSize: 12 } },
                                InputLabelProps: { sx: { fontSize: 12 } }
                            }
                        }}
                    />
                </Grid>
                <Grid size={ACTION_BAR_ACTIONS_GRID}>
                    <Box className={'action-bar-actions-row'}>
                        <Box className={'action-bar-actions-group'}>
                            <Button
                                variant={'contained'}
                                onClick={handleSearch}
                                startIcon={
                                    <SearchRounded fontSize={'inherit'} />
                                }
                                size={'small'}
                                sx={{
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
                                    fontSize: 12,
                                    textTransform: 'capitalize'
                                }}>
                                {t('actionBar.refresh')}
                            </Button>
                        </Box>
                        <Box className={'action-bar-actions-group'}>
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
