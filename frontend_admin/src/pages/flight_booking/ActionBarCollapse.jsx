import {
    ExpandMoreRounded,
    RefreshRounded,
    SearchRounded
} from '@mui/icons-material';
import { Box, Button, Grid, Paper, TextField } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { actionBarPaperSx } from '../_shared/actionBarStyles';

const ActionBarCollapse = ({
    onSearch,
    searchModal,
    setPaginationModel,
    setIsExpand
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({});

    const items = [
        { name: 'bookingReference', label: '预订编号' },
        { name: 'contactEmail', label: '联系邮箱' },
        { name: 'airlineCode', label: '航司代码' }
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
            sortBy: searchModal.sortBy
        });
        setPaginationModel({ page: 0, pageSize: searchModal.limit });
    };

    const handleReset = () => {
        setFormData({});
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
                spacing={2}
                width='100%'>
                {items.map((item) => (
                    <Grid
                        size={{ xs: 12, sm: 4, md: 2 }}
                        key={item.name}>
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
                    </Grid>
                ))}
                <Grid size={{ xs: 12, md: 6 }}>
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
                                startIcon={<ExpandMoreRounded fontSize='inherit' />}
                                size='small'
                                sx={{
                                    fontSize: 12,
                                    textTransform: 'capitalize'
                                }}
                                onClick={() => setIsExpand(true)}>
                                {t('actionBar.expand')}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default ActionBarCollapse;
