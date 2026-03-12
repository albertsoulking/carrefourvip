import { useState } from 'react';
import { Button } from '@mui/material';
import ModalCreate from './ModalCreate';
import usePermissionStore from '../../hooks/usePermissionStore';
import { AddRounded } from '@mui/icons-material';

export default function ButtonAdd() {
    const permissions = usePermissionStore((state) => state.permissions);
    const [open, setOpen] = useState(false);

    return (
        <>
            {permissions.includes('order.add') && (
                <Button
                    variant={'contained'}
                    startIcon={<AddRounded fontSize={'inherit'} />}
                    onClick={() => setOpen(true)}
                    sx={{ ml: 'auto', fontSize: 12 }}
                    size={'small'}>
                    新建订单
                </Button>
            )}
            <ModalCreate
                open={open}
                setOpen={setOpen}
            />
        </>
    );
}
