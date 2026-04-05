import { Box, Button } from '@mui/material';
import ModalDelete from './ModalDelete';
import ModalUpdate from './ModalUpdate';
import { useState } from 'react';
import usePermissionStore from '../../hooks/usePermissionStore';

const RowActions = ({
    data
}) => {
    const permissions = usePermissionStore((state) => state.permissions);
    const [openDelete, setOpenDelete] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);

    return (
        <Box>
            {permissions.includes('category.edit') && (
                <Button
                    size={'small'}
                    sx={{ fontSize: 12, p: 0 }}
                    onClick={() => setOpenUpdate(true)}>
                    详细
                </Button>
            )}
            {permissions.includes('category.delete') && (
                <Button
                    color={'error'}
                    size={'small'}
                    sx={{ fontSize: 12, p: 0 }}
                    onClick={() => setOpenDelete(true)}>
                    删除
                </Button>
            )}
            <ModalDelete
                open={openDelete}
                data={data}
                setOpen={setOpenDelete}
            />
            <ModalUpdate
                open={openUpdate}
                data={data}
                setOpen={setOpenUpdate}
            />
        </Box>
    );
};

export default RowActions;
