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
        label: 'submitted',
        value: 'submitted',
        color: 'default',
        icon: <AccessTimeFilledRounded />
    },
    {
        label: 'table.processing',
        value: 'processing',
        color: 'default',
        icon: <InventoryRounded />
    },
    {
        label: 'confirmed',
        value: 'confirmed',
        color: 'success',
        icon: <LocalShippingRounded />
    },
    {
        label: 'table.cancelled',
        value: 'cancelled',
        color: 'error',
        icon: <CancelRounded />
    }
];

export default function RowStatus({ status, onChange }) {
    // const permissions = usePermissionStore((state) => state.permissions);
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);
    const current = OPTIONS.find((s) => s.value === status);

    const handleClick = (e) => {
        // if (permissions.includes('order.changeOrderStatus'))
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
