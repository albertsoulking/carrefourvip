import {
    CancelRounded,
    CheckCircleRounded
} from '@mui/icons-material';
import { Chip, Box, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import usePermissionStore from '../../hooks/usePermissionStore';
import { useTranslation } from '../../../node_modules/react-i18next';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

const OPTIONS = [
    {
        label: '启用',
        value: true,
        color: 'primary',
        icon: <CheckCircleRounded />
    },
    {
        label: '禁用',
        value: false,
        color: 'error',
        icon: <CancelRounded />
    }
];

export default function RowCollect({ id, status }) {
    const permissions = usePermissionStore((state) => state.permissions);
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);
    const current = OPTIONS.find((s) => s.value === status);

    const handleClick = (e) => {
        if (permissions.includes('category.changeVatCollect'))
            setAnchorEl(e.currentTarget);
    };

    const handleSelect = async (newStatus) => {
         const payload = {
            id,
            isCollect: newStatus
        };

        try {
            await api.category.update(payload);
             setAnchorEl(null);
        } catch (error) {
            enqueueSnackbar(
                Array.isArray(error.response?.data?.message)
                    ? error.response.data.message[0]
                    : error.response?.data?.message || error.message,
                {
                    variant: 'error'
                }
            );
        }
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
