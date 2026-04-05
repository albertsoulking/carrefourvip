import { Box, Button } from '@mui/material';
import usePermissionStore from '../../hooks/usePermissionStore';
import ModalChangePassword from './ModalChangePassword';
import ModalDelete from './ModalDelete';
import ModalUpdateMenu from './ModalUpdateMenu';
import { useState } from 'react';

const RowActions = ({
    data
}) => {
    const permissions = usePermissionStore((state) => state.permissions);
    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openPermission, setOpenPermission] = useState(false);

    return (
        <Box>
            {permissions.includes('admin.editPermission') && (
                <Button
                    size={'small'}
                    sx={{ fontSize: 12, p: 0 }}
                    onClick={() => setOpenPermission(true)}>
                    编辑权限
                </Button>
            )}
            {permissions.includes('admin.changePassword') && (
                <Button
                    size={'small'}
                    sx={{ fontSize: 12, p: 0 }}
                    onClick={() =>
                        setOpenChangePassword(true)
                    }>
                    更改密码
                </Button>
            )}
            {permissions.includes('admin.delete') && (
                <Button
                    color={'error'}
                    size={'small'}
                    sx={{ fontSize: 12, p: 0 }}
                    onClick={() => setOpenDelete(true)}>
                    删除
                </Button>
            )}
            <ModalChangePassword
                open={openChangePassword}
                data={data}
                setOpen={setOpenChangePassword}
            />
            <ModalDelete
                open={openDelete}
                data={data}
                setOpen={setOpenDelete}
            />
            <ModalUpdateMenu
                open={openPermission}
                data={data}
                setOpen={setOpenPermission}
            />
        </Box>
    );
};

export default RowActions;
