import {
    CategoryRounded,
    CheckRounded,
    KeyboardDoubleArrowRightRounded,
    RestaurantRounded
} from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

export default function Overview({ data, onSearch, setPaginationModel }) {
    const items = [
        {
            label: '总分类数',
            icon: (
                <CategoryRounded
                    color={'primary'}
                    sx={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        opacity: 0.3,
                        fontSize: 40
                    }}
                />
            ),
            color: 'primary',
            total: data?.totalDeletedCategories ?? 0,
            onClick: () => {
                onSearch({
                    page: 1,
                    limit: 10,
                    orderBy: 'desc',
                    sortBy: 'id'
                });
                setPaginationModel({ page: 0, pageSize: 10 });
            }
        },
        {
            label: '分类数（本月删除）',
            icon: (
                <RestaurantRounded
                    color={'info'}
                    sx={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        opacity: 0.3,
                        fontSize: 40
                    }}
                />
            ),
            color: 'info',
            total: data?.oldCategories ?? 0,
            onClick: () => {
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const endOfMonth = new Date(startOfMonth);
                endOfMonth.setMonth(endOfMonth.getMonth() + 1);

                onSearch({
                    page: 1,
                    limit: 10,
                    orderBy: 'desc',
                    sortBy: 'id',
                    fromDate: startOfMonth,
                    toDate: endOfMonth
                });
                setPaginationModel({ page: 0, pageSize: 10 });
            }
        }
    ];

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(4, 1fr)'
                },
                gap: 3,
                mb: 2
            }}>
            {items.map((item, index) => (
                <Card
                    key={index}
                    sx={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        position: 'relative',
                        borderRadius: 2,
                        bgcolor: '#fff',
                        transition: '0.6s ease',
                        '&:hover': {
                            boxShadow:
                                '0 6px 24px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0,0,0,0.08)'
                        }
                    }}>
                    <CardContent>
                        <Typography
                            color={'textSecondary'}
                            variant={'subtitle2'}
                            gutterBottom
                            noWrap>
                            {item.label}
                        </Typography>
                        <Typography
                            variant={'h4'}
                            component={'div'}
                            color={item.color}
                            fontWeight={'bold'}
                            noWrap>
                            {item.total}
                        </Typography>
                        {item.icon}
                        <Button
                            size={'small'}
                            sx={{
                                position: 'absolute',
                                right: 5,
                                bottom: 5,
                                fontSize: 12
                            }}
                            endIcon={
                                <KeyboardDoubleArrowRightRounded
                                    fontSize={'inherit'}
                                />
                            }
                            onClick={item.onClick}>
                            查看
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
