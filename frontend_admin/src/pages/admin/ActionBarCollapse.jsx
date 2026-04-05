import {
    RefreshRounded,
    SearchRounded,
    ExpandMoreRounded
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
import { useState } from 'react';
import { useTranslation } from '../../../node_modules/react-i18next';
import ButtonRecycle from './ButtonRecycle';
import ButtonAdd from './ButtonAdd';

const ActionBarCollapse = ({
    onSearch,
    searchModal,
    setPaginationModel,
    setIsExpand
}) => {
    const items = [
        { name: 'adminId', label: '代理ID', type: 'number' },
        { name: 'name', label: '名称' },
        { name: 'email', label: '邮箱' }
    ];

    const { t } = useTranslation();
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
            ...formData
        });
    };

    const handleReset = () => {
        setFormData({});
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
                spacing={2}
                width={'100%'}>
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
                <Grid size={{ xs: 12, sm: 6 }}>
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
                                    <ExpandMoreRounded fontSize={'inherit'} />
                                }
                                size={'small'}
                                sx={{
                                    fontSize: 12,
                                    textTransform: 'capitalize'
                                }}
                                onClick={() => setIsExpand(true)}>
                                {t('actionBar.expand')}
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

export default ActionBarCollapse;
