import { Box, Button } from '@mui/material';
import usePermissionStore from '../../hooks/usePermissionStore';
import { useTranslation } from '../../../node_modules/react-i18next';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

const RowActions = ({ data }) => {
    const permissions = usePermissionStore((state) => state.permissions);
    const { t } = useTranslation();

    const onRestore = async () => {
        const payload = {
            id: data?.id
        };

        try {
            await api.ticket.restore(payload);
            enqueueSnackbar('恢复成功!', {
                variant: 'success'
            });
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
            {permissions.includes('ticket.delete.restore') && (
                <Button
                    color={'success'}
                    size={'small'}
                    sx={{ fontSize: 12, p: 0, textTransform: 'capitalize' }}
                    onClick={onRestore}>
                    {t('table.restore')}
                </Button>
            )}
        </Box>
    );
};

export default RowActions;
