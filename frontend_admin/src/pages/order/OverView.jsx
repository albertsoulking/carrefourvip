import {
    AddRoadRounded,
    CheckRounded,
    KeyboardDoubleArrowRightRounded,
    PersonRounded,
    VerifiedUserRounded
} from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from '../../../node_modules/react-i18next';

export default function Overview({ data, onSearch, setPaginationModel }) {
    const { t } = useTranslation();
    
    const items = [
        {
            label: t('order.overview.totalOrders'),
            icon: (
                <PersonRounded
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
            total: data?.totalOrders ?? 0,
            onClick: () => {
                onSearch({
                    page: 1,
                    limit: 10,
                    orderBy: 'desc',
                    sortBy: 'id',
                    mode: 'live'
                });
                setPaginationModel({ page: 0, pageSize: 10 });
            }
        },
        {
            label: t('order.overview.monthlyOrders'),
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
            total: data?.monthlyOrders ?? 0,
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
            label: t('order.overview.pendingOrders'),
            icon: (
                <AddRoadRounded
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
            total: data?.pendingOrders ?? 0,
            onClick: () => {
                onSearch({
                    page: 1,
                    limit: 10,
                    orderBy: 'desc',
                    sortBy: 'id',
                    paymentStatus: 'pending'
                });
                setPaginationModel({ page: 0, pageSize: 10 });
            }
        },
        {
            label: t('order.overview.totalRevenue'),
            icon: (
                <VerifiedUserRounded
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
            total: `€${
                data?.totalRevenue
                    ? Number(data.totalRevenue).toLocaleString(
                          undefined,

                          {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                          }
                      )
                    : '0.00'
            }`,
            onClick: () => {
                onSearch({
                    page: 1,
                    limit: 10,
                    orderBy: 'desc',
                    sortBy: 'id',
                    paymentStatus: 'paid'
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
                            {t('table.view')}
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
