import { Box, Button } from '@mui/material';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';
import usePermissionStore from '../../hooks/usePermissionStore';

const RowActions = ({ data }) => {
    const permissions = usePermissionStore((state) => state.permissions);

    const onRestore = async () => {
        const payload = {
            id: data?.id
        };

        try {
            await api.user.restore(payload);
            setOpen(false);
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
            {permissions.includes('customer.delete.restore') && (
                <Button
                    color={'success'}
                    size={'small'}
                    sx={{ fontSize: 12, p: 0, textTransform: 'capitalize' }}
                    onClick={onRestore}>
                    恢复
                </Button>
            )}
        </Box>
    );
};

export default RowActions;
