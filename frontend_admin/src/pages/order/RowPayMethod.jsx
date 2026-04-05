import { Box, Chip, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import usePermissionStore from '../../hooks/usePermissionStore';
import { useTranslation } from 'react-i18next';

const OPTIONS = [
    {
        label: 'table.stripe',
        value: 'stripe',
        color: 'info',
        visible: 0
    },
    {
        label: 'table.paypal',
        value: 'paypal',
        color: 'primary',
        visible: 1
    },
    {
        label: 'table.balance',
        value: 'balance',
        color: 'default',
        visible: 0
    },
    {
        label: 'table.hybrid',
        value: 'hybrid',
        color: 'secondary',
        visible: 0
    },
    {
        label: 'table.card',
        value: 'card',
        color: 'success',
        visible: 1
    },
    {
        label: 'table.pay2s',
        value: 'pay2s',
        color: 'success',
        visible: 0
    },
    {
        label: 'table.lemon',
        value: 'lemon',
        color: 'warning',
        visible: 0
    },
    {
        label: 'table.behalf',
        value: 'behalf',
        color: 'default',
        visible: 1
    },
    {
        label: 'table.starpay',
        value: 'starpay',
        color: 'info',
        visible: 0
    },
    {
        label: 'table.faf',
        value: 'faf',
        color: 'info',
        visible: 1
    },
    {
        label: 'table.wise',
        value: 'wise',
        color: 'info',
        visible: 1
    }
];

export default function RowPayMethod({ status, onChange }) {
    const permissions = usePermissionStore((state) => state.permissions);
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);
    const current = OPTIONS.find((s) => s.value === status);

    const handleClick = (e) => {
        if (permissions.includes('order.changePayMethod'))
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
                size={'small'}
                sx={{ cursor: 'pointer', fontSize: 12 }}
                onClick={handleClick}
            />
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}>
                {OPTIONS.filter((s) => s.visible === 1).map((s) => (
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
