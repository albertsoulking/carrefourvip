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
            gap={2}
            justifyContent={'space-around'}>
            <Button
                color={'inherit'}
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
