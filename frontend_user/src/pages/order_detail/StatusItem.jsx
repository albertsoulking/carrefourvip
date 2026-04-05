import {
    AccessTimeFilledRounded,
    CancelRounded,
    CheckCircleRounded,
    CurrencyExchangeRounded,
    InventoryRounded,
    LocalShippingRounded
} from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

const StatusItem = ({ status }) => {
    const statusMap = {
        pending: {
            label: 'Payment Pending',
            color: 'action',
            icon: (
                <AccessTimeFilledRounded
                    sx={{ verticalAlign: 'middle', mr: 1 }}
                />
            )
        },
        processing: {
            label: 'Processing',
            color: 'warning',
            icon: <InventoryRounded sx={{ verticalAlign: 'middle', mr: 1 }} />
        },
        shipped: {
            label: 'Delivering',
            color: 'info',
            icon: (
                <LocalShippingRounded sx={{ verticalAlign: 'middle', mr: 1 }} />
            )
        },
        delivered: {
            label: 'Completed',
            color: 'success',
            icon: <CheckCircleRounded sx={{ verticalAlign: 'middle', mr: 1 }} />
        },
        cancelled: {
            label: 'Cancelled',
            color: 'error',
            icon: <CancelRounded sx={{ verticalAlign: 'middle', mr: 1 }} />
        },
        refunded: {
            label: 'Refunded',
            color: 'secondary',
            icon: (
                <CurrencyExchangeRounded
                    sx={{ verticalAlign: 'middle', mr: 1 }}
                />
            )
        }
    };

    return (
        <Box
            textAlign={'center'}
            sx={{
                border: '1px solid #00000033',
                p: 4,
                borderRadius: 2,
                mb: 2
            }}>
            {status ? (
                <Typography
                    variant={'h5'}
                    color={statusMap[status].color}
                    sx={{ verticalAlign: 'middle' }}>
                    {statusMap[status].icon}
                    <span
                        style={{
                            marginLeft: 4,
                            display: statusMap[status].label ? 'inline' : 'none'
                        }}>
                        {statusMap[status].label}
                    </span>
                </Typography>
            ) : (
                <Typography
                    variant={'h5'}
                    sx={{ verticalAlign: 'middle' }}>
                    Loading...
                </Typography>
            )}
        </Box>
    );
};

export default StatusItem;
