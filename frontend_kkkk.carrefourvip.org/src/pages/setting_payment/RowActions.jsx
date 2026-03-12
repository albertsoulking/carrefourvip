import { Box, Button } from '@mui/material';

const RowActions = ({
    data,
    setOpenDeleteModal,
    permissions,
    setOpenUpdateModal,
    setOpenDetailModal
}) => {
    return (
        <Box>
            {permissions.includes('category.edit') && (
                <Button
                    size={'small'}
                    sx={{ fontSize: 12, p: 0 }}
                    onClick={() => setOpenUpdateModal({ open: true, data })}>
                    编辑
                </Button>
            )}
            {permissions.includes('category.delete') && (
                <Button
                    color={'error'}
                    size={'small'}
                    sx={{ fontSize: 12, p: 0 }}
                    onClick={() => setOpenDeleteModal({ open: true, data })}>
                    删除
                </Button>
            )}
            <Button
                size={'small'}
                sx={{ fontSize: 12, p: 0 }}
                onClick={() => setOpenDetailModal({ open: true, data })}>
                查看
            </Button>
        </Box>
    );
};

export default RowActions;
