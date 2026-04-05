import {
    CategoryRounded,
    CheckRounded,
    RestaurantRounded
} from '@mui/icons-material';
import { Box, Card, CardContent, Typography } from '@mui/material';

export default function Overview({ data }) {
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
            total: data?.totalCategories ?? 0
        },
        {
            label: '有商品的分类数',
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
            total: data?.activeCategories ?? 0
        },
        {
            label: '本月新增分类',
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
            total: data?.newCategories ?? 0
        },
        {
            label: '商品最多的分类',
            icon: (
                <CategoryRounded
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
            total: data ? `${data.topCategory.productCount}(${data.topCategory.name})` : '-'
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
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
