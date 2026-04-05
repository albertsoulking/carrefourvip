import { Box, Button } from '@mui/material';
import usePermissionStore from '../../hooks/usePermissionStore';
import { useState } from 'react';
import ModalDetail from './ModalDetail';
import ModalDelete from './ModalDelete';

const RowActions = ({ data }) => {
    const permissions = usePermissionStore((state) => state.permissions);
    const [openDelete, setOpenDelete] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);

    return (
        <Box>
            {permissions.includes('product.view') && (
                <Button
                    size={'small'}
                    sx={{ fontSize: 12, p: 0 }}
                    onClick={() => setOpenDetail(true)}>
                    详细
                </Button>
            )}
            {permissions.includes('product.edit') && (
                <Button
                    onClick={() => setOpenDelete(true)}
                    color={'error'}
                    sx={{ fontSize: 12, p: 0 }}>
                    删除
                </Button>
            )}
            <ModalDelete
                open={openDelete}
                data={data}
                setOpen={setOpenDelete}
            />
            <ModalDetail
                open={openDetail}
                data={data}
                setOpen={setOpenDetail}
            />
        </Box>
    );
};

export default RowActions;
