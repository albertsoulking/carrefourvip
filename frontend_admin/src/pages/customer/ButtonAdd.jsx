import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import ModalCreate from './ModalCreate';
import usePermissionStore from '../../hooks/usePermissionStore';
import { AddRounded } from '@mui/icons-material';

export default function ButtonAdd() {
    const permissions = usePermissionStore((state) => state.permissions);
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <>
            {permissions.includes('customer.add') && (
                <Button
                    variant={'contained'}
                    startIcon={<AddRounded fontSize={'inherit'} />}
                    onClick={() => setOpen(true)}
                    sx={{ ml: 'auto', fontSize: 12 }}
                    size={'small'}>
                    添加客户
                </Button>
            )}
            <ModalCreate
                open={open}
                setOpen={setOpen}
            />
        </>
    );
}
