import {
    AccessTimeFilledRounded,
    CancelRounded,
    CheckCircleRounded,
    CurrencyExchangeRounded,
    InventoryRounded,
    LocalShippingRounded
} from '@mui/icons-material';
import { Chip, Box, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import usePermissionStore from '../../hooks/usePermissionStore';
import { useTranslation } from 'react-i18next';

const OPTIONS = [
    {
        label: 'table.pending',
        value: 'pending',
        color: 'default',
        icon: <AccessTimeFilledRounded />
    },
    {
        label: 'table.processing',
        value: 'processing',
        color: 'warning',
        icon: <InventoryRounded />
    },
    {
        label: 'table.shipped',
        value: 'shipped',
        color: 'warning',
        icon: <LocalShippingRounded />
    },
    {
        label: 'table.delivered',
        value: 'delivered',
        color: 'primary',
        icon: <CheckCircleRounded />
    },
    {
        label: 'table.cancelled',
        value: 'cancelled',
        color: 'error',
        icon: <CancelRounded />
    },
    {
        label: 'table.refunded',
        value: 'refunded',
        color: 'secondary',
        icon: <CurrencyExchangeRounded />
    }
];

export default function RowOrderStatus({ status, onChange }) {
    const permissions = usePermissionStore((state) => state.permissions);
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);
    const current = OPTIONS.find((s) => s.value === status);

    const handleClick = (e) => {
        if (permissions.includes('order.changeOrderStatus'))
            setAnchorEl(e.currentTarget);
    };

    const handleSelect = (newStatus) => {
        onChange(newStatus);
        setAnchorEl(null);
    };

    return (
        <Box>
            <Chip
                label={t(current?.label)}
                color={current?.color}
                icon={current?.icon}
                onClick={handleClick}
                size={'small'}
                sx={{ cursor: 'pointer', fontSize: 12 }}
            />
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}>
                {OPTIONS.map((s) => (
                    <MenuItem
                        key={s.value}
                        sx={{ fontSize: 12, py: 0.5 }}
                        onClick={() => handleSelect(s.value)}
                        selected={s.value === status}>
                        {t(s.label)}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}
