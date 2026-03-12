import { Badge, Box, Button } from '@mui/material';
import usePermissionStore from '../../hooks/usePermissionStore';
import { useTranslation } from 'react-i18next';
import ModalDetail from './ModalDetail';
import { useState } from 'react';
import ModalChangePassword from './ModalChangePassword';
import ModalDelete from './ModalDelete';

const RowActions = ({ data }) => {
    const { t } = useTranslation();
    const permissions = usePermissionStore((state) => state.permissions);
    const [openDetail, setOpenDetail] = useState(false);
    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    return (
        <Box>
            {permissions.includes('customer.view') && (
                <Button
                    size={'small'}
                    sx={{ fontSize: 12, p: 0, textTransform: 'capitalize' }}
                    onClick={() => setOpenDetail(true)}>
                    {t('table.view')}
                </Button>
            )}
            {permissions.includes('customer.changePassword') && (
                <Button
                    size={'small'}
                    sx={{ fontSize: 12, p: 0, textTransform: 'capitalize' }}
                    onClick={() => setOpenChangePassword(true)}>
                    {t('acc.changePass')}
                </Button>
            )}
            {permissions.includes('customer.delete') && (
                <Button
                    color={'error'}
                    size={'small'}
                    sx={{ fontSize: 12, p: 0, textTransform: 'capitalize' }}
                    onClick={() => setOpenDelete(true)}>
                    {t('table.delete')}
                </Button>
            )}
            <ModalDetail
                open={openDetail}
                data={data}
                setOpen={setOpenDetail}
            />
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
        </Box>
    );
};

export default RowActions;
