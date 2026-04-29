import {
    ArrowDropDownRounded,
    ArrowDropUpRounded,
    RefreshRounded
} from '@mui/icons-material';
import { Box, Button } from '@mui/material';

const CategoryFilter = ({ filter, setFilter }) => {
    return (
        <Box
            mt={1}
            display={'flex'}
            gap={1}
            justifyContent={'space-between'}
            sx={{
                p: 0.75,
                bgcolor: 'var(--brand-paper)',
                border: '1px solid var(--brand-line)',
                borderRadius: 'var(--brand-radius-md)'
            }}>
            <Button
                color={'inherit'}
                sx={{
                    flex: 1,
                    minWidth: 0,
                    color: 'var(--brand-ink)',
                    '&:hover': { bgcolor: 'rgba(127, 127, 127, 0.08)' }
                }}
                onClick={() =>
                    setFilter({
                        orderBy: filter.orderBy === 'asc' ? 'desc' : 'asc',
                        sortBy: 'name'
                    })
                }
                endIcon={
                    <Box
                        display={'flex'}
                        flexDirection={'column'}>
                        <ArrowDropUpRounded
                            color={
                                filter.sortBy === 'name'
                                    ? filter.orderBy === 'asc'
                                        ? 'primary'
                                        : 'disabled'
                                    : 'disabled'
                            }
                        />
                        <ArrowDropDownRounded
                            color={
                                filter.sortBy === 'name'
                                    ? filter.orderBy === 'desc'
                                        ? 'primary'
                                        : 'disabled'
                                    : 'disabled'
                            }
                            sx={{ mt: -2 }}
                        />
                    </Box>
                }>
                Name
            </Button>
            <Button
                color={'inherit'}
                sx={{
                    flex: 1,
                    minWidth: 0,
                    color: 'var(--brand-ink)',
                    '&:hover': { bgcolor: 'rgba(127, 127, 127, 0.08)' }
                }}
                onClick={() =>
                    setFilter({
                        orderBy: filter.orderBy === 'asc' ? 'desc' : 'asc',
                        sortBy: 'price'
                    })
                }
                endIcon={
                    <Box
                        display={'flex'}
                        flexDirection={'column'}>
                        <ArrowDropUpRounded
                            color={
                                filter.sortBy === 'price'
                                    ? filter.orderBy === 'asc'
                                        ? 'primary'
                                        : 'disabled'
                                    : 'disabled'
                            }
                        />
                        <ArrowDropDownRounded
                            color={
                                filter.sortBy === 'price'
                                    ? filter.orderBy === 'desc'
                                        ? 'primary'
                                        : 'disabled'
                                    : 'disabled'
                            }
                            sx={{ mt: -2 }}
                        />
                    </Box>
                }>
                Price
            </Button>
            <Button
                color={'inherit'}
                sx={{
                    flex: 1,
                    minWidth: 0,
                    color: 'var(--brand-ink)',
                    '&:hover': { bgcolor: 'rgba(127, 127, 127, 0.08)' }
                }}
                onClick={() =>
                    setFilter({
                        orderBy: filter.orderBy === 'asc' ? 'desc' : 'asc',
                        sortBy: 'id'
                    })
                }
                endIcon={
                    <Box
                        display={'flex'}
                        flexDirection={'column'}>
                        <ArrowDropUpRounded
                            color={
                                filter.sortBy === 'id'
                                    ? filter.orderBy === 'asc'
                                        ? 'primary'
                                        : 'disabled'
                                    : 'disabled'
                            }
                        />
                        <ArrowDropDownRounded
                            color={
                                filter.sortBy === 'id'
                                    ? filter.orderBy === 'desc'
                                        ? 'primary'
                                        : 'disabled'
                                    : 'disabled'
                            }
                            sx={{ mt: -2 }}
                        />
                    </Box>
                }>
                Latest
            </Button>
            <Button
                sx={{
                    flex: 1,
                    minWidth: 0,
                    '&:hover': { bgcolor: 'rgba(127, 127, 127, 0.08)' }
                }}
                endIcon={<RefreshRounded />}
                onClick={() =>
                    setFilter({
                        orderBy: null,
                        sortBy: null
                    })
                }>
                Reset
            </Button>
        </Box>
    );
};

export default CategoryFilter;
