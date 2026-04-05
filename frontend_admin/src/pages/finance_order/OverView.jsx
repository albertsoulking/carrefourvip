import {
    AddRoadRounded,
    CheckRounded,
    PersonRounded,
    VerifiedUserRounded
} from '@mui/icons-material';
import { Box, Card, CardContent, Typography } from '@mui/material';

export default function Overview({ data }) {
    const items = [
        {
            label: '总交易金额',
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
            total: data
                ? `${data.totalAmount}/${data.totalCount}`
                : '0/0'
        },
        {
            label: '今日交易金额',
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
            total: data
                ? `${data.todayAmount}/${data.todayCount}`
                : '0/0'
        },
        {
            label: '成功交易笔数',
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
            total: data
                ? `${data.successAmount}/${data.successCount}`
                : '0/0'
        },
        {
            label: '失败交易笔数',
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
            total: data
                ? `${data.failedAmount}/${data.failedCount}`
                : '0/0'
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
                            gutterBottom>
                            {item.label}
                        </Typography>
                        <Typography
                            variant={'h4'}
                            component={'div'}
                            color={item.color}
                            fontWeight={'bold'}>
                            {item.total}
                        </Typography>
                        {item.icon}
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
