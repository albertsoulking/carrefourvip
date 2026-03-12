import { Box, Button } from '@mui/material';
import { useState } from 'react';
import usePermissionStore from '../../hooks/usePermissionStore';
import ModalUpdateMenu from '../admin/ModalUpdateMenu';

const RowActions = ({ data }) => {
    const permissions = usePermissionStore((state) => state.permissions);
    const [openMenu, setOpenMenu] = useState(false);

    return (
        <Box>
            {permissions.includes('role.editPermission') && (
                <Button
                    size={'small'}
                    sx={{ fontSize: 12, p: 0 }}
                    onClick={() => setOpenMenu(true)}>
                    编辑权限
                </Button>
            )}
            <ModalUpdateMenu
                    open={openMenu}
                    data={data}
                    setOpen={setOpenMenu}
                />
        </Box>
    );
};

export default RowActions;
