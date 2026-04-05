import {
    AddRoadRounded,
    CheckRounded,
    KeyboardDoubleArrowRightRounded,
    PersonRounded,
    VerifiedUserRounded
} from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

export default function Overview({ data, onSearch, setPaginationModel }) {
    const items = [
        {
            label: '总客户数',
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
            total: data?.totalCustomers ?? 0,
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
            label: '新客户（本月注册）',
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
            total: data?.newCustomers ?? 0,
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
                    mode: 'live',
                    fromDate: startOfMonth,
                    toDate: endOfMonth
                });
                setPaginationModel({ page: 0, pageSize: 10 });
            }
        },
        {
            label: '活跃客户(30天内有下单/登录)',
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
            total: data?.activeCustomers ?? 0,
            onClick: () => {
                const cusDate = new Date();
                cusDate.setDate(cusDate.getDate() - 30);

                onSearch({
                    page: 1,
                    limit: 10,
                    orderBy: 'desc',
                    sortBy: 'id',
                    mode: 'live',
                    cusDate,
                    hasOrder: true
                });
                setPaginationModel({ page: 0, pageSize: 10 });
            }
        },
        {
            label: '高价值客户(消费 ≥ 100€)',
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
            total: data?.highValueCustomers ?? 0,
            onClick: () => {
                const cusDate = new Date();
                cusDate.setDate(cusDate.getDate() - 30);

                onSearch({
                    page: 1,
                    limit: 10,
                    orderBy: 'desc',
                    sortBy: 'id',
                    mode: 'live',
                    cusDate,
                    hasValue: true
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
