import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const RowActions = ({
    data,
    setOpenDeleteModal,
    permissions,
    setOpenUpdateModal,
    setOpenDetailModal
}) => {
    const { t } = useTranslation();
    return (
        <Box>
            {permissions.includes('category.edit') && (
                <Button
                    size={'small'}
                    sx={{ fontSize: 12, p: 0 }}
                    onClick={() => setOpenUpdateModal({ open: true, data })}>
                    {t('table.edit')}
                </Button>
            )}
            {permissions.includes('category.delete') && (
                <Button
                    color={'error'}
                    size={'small'}
                    sx={{ fontSize: 12, p: 0 }}
                    onClick={() => setOpenDeleteModal({ open: true, data })}>
                    {t('table.delete')}
                </Button>
            )}
            <Button
                size={'small'}
                sx={{ fontSize: 12, p: 0 }}
                onClick={() => setOpenDetailModal({ open: true, data })}>
                {t('table.view')}
            </Button>
        </Box>
    );
};

export default RowActions;
