import { Box, Button } from '@mui/material';
import usePermissionStore from '../../hooks/usePermissionStore';
import ModalDelete from './ModalDelete';
import { useState } from 'react';
import ModalViewHistory from './ModalViewHistory';

const RowActions = ({ data }) => {
    const permissions = usePermissionStore((state) => state.permissions);
    const [openDelete, setOpenDelete] = useState(false);
    const [openHistory, setOpenHistory] = useState(false);

    return (
        <Box>
            {permissions.includes('ticket.view') && (
                <Button
                    size={'small'}
                    sx={{ fontSize: 12, p: 0 }}
                    onClick={() => setOpenHistory(true)}>
                    查看
                </Button>
            )}
            {permissions.includes('ticket.delete') && (
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
            <ModalViewHistory
                open={openHistory}
                data={data}
                setOpen={setOpenHistory}
            />
        </Box>
    );
};

export default RowActions;
