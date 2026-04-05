import { Grid, Typography, Box } from '@mui/material';
import {
    AttachMoneyRounded,
    AutorenewRounded,
    DoneAllRounded,
    PersonAddRounded,
    ReportGmailerrorredRounded,
    TrendingUpRounded
} from '@mui/icons-material';

const statsConfig = [
    {
        key: 'totalRevenue',
        color: '#4caf50',
        icon: <TrendingUpRounded />,
        iconBgcolor: '#dcfce7',
        iconColor: '#16a34a',
        prefix: '€ '
    },
    {
        key: 'balance',
        color: '#4caf50',
        icon: <AttachMoneyRounded />,
        iconBgcolor: '#e0f2fe',
        iconColor: '#0284c7',
        prefix: '€ '
    },
    {
        key: 'newCustomers',
        color: '#4caf50',
        icon: <PersonAddRounded />,
        iconBgcolor: '#ede9fe',
        iconColor: '#7c3aed'
    },
    {
        key: 'completedOrders',
        color: '#4caf50',
        icon: <DoneAllRounded />,
        iconBgcolor: '#dbeafe',
        iconColor: '#2563eb'
    },
    {
        key: 'processingOrders',
        color: '#4caf50',
        icon: <AutorenewRounded />,
        iconBgcolor: '#fef9c3',
        iconColor: '#ca8a04'
    },
    {
        key: 'cancelledOrders',
        color: '#4caf50',
        icon: <ReportGmailerrorredRounded />,
        iconBgcolor: '#fee2e2',
        iconColor: '#dc2626'
    }
];

export default function Overview({ data, t }) {
    const formatValue = (value, prefix = '') => {
        if (value === null || value === undefined) return '-';
        if (!isNaN(value)) return `${prefix}${Number(value)}`;
        return `${prefix}${value}`;
    };

    return (
        <Grid
            container
            spacing={2}>
            {statsConfig.map((item) => (
                <Grid
                    size={{ xs: 12, md: 6, lg: 4, xl: 2 }}
                    key={item.key}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            borderRadius: 2,
                            minHeight: 80,
                            bgcolor: '#fff',
                            transition: '0.6s ease',
                            '&:hover': {
                                boxShadow:
                                    '0 6px 24px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0,0,0,0.08)'
                            }
                        }}>
                        <Box
                            sx={{
                                bgcolor: item.iconBgcolor,
                                color: item.iconColor,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                                width: 44,
                                height: 44
                            }}>
                            {item.icon || <TrendingUpRounded />}
                        </Box>
                        <Box>
                            <Typography
                                variant={'body2'}
                                color={'text.secondary'}
                                fontWeight={500}>
                                {t(`dashboard.overview.${item.key}`)}
                            </Typography>
                            <Typography
                                variant={'h5'}
                                fontWeight={700}
                                translate={'no'}>
                                {data ? formatValue(data[item.key], item.prefix) : '-'}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
}
