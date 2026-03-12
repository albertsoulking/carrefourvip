import {
    CheckRounded,
    FastfoodRounded,
    GrassRounded,
    KeyboardDoubleArrowRightRounded,
    StarRounded
} from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

export default function Overview({ data, onSearch, setPaginationModel }) {
    const items = [
        {
            label: '总商品数',
            icon: (
                <FastfoodRounded
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
            total: data?.totalProducts ?? 0,
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
            label: '上架商品数',
            icon: (
                <CheckRounded
                    color={'success'}
                    sx={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        opacity: 0.3,
                        fontSize: 40
                    }}
                />
            ),
            color: 'success',
            total: data?.availableProducts ?? 0,
            onClick: () => {
                onSearch({
                    page: 1,
                    limit: 10,
                    orderBy: 'desc',
                    sortBy: 'id',
                    isAvailable: 1
                });
                setPaginationModel({ page: 0, pageSize: 10 });
            }
        },
        {
            label: '本月新增商品数',
            icon: (
                <StarRounded
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
            total: data?.newProducts ?? 0,
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
        },
        {
            label: '热销商品数(近30天销量 ≥ 10)',
            icon: (
                <GrassRounded
                    color={'secondary'}
                    sx={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        opacity: 0.3,
                        fontSize: 40
                    }}
                />
            ),
            color: 'secondary',
            total: data?.hotSellingProducts ?? 0,
            onClick: () => {
                const recentDate = new Date();
                recentDate.setDate(recentDate.getDate() - 30);

                onSearch({
                    page: 1,
                    limit: 10,
                    orderBy: 'desc',
                    sortBy: 'id',
                    hasHot: true,
                    cusDate: recentDate
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
                            sx={{ position: 'absolute', right: 5, bottom: 5, fontSize: 12 }}
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
