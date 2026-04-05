import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import usePermissionStore from '../../hooks/usePermissionStore';
import ModalViewOrderDetail from './ModalViewOrderDetail';
import ModalDeleteOrder from './ModalDeleteOrder';
import { useState } from 'react';

const RowActions = ({ data }) => {
    const permissions = usePermissionStore((state) => state.permissions);
    const { t } = useTranslation();
    const [openDetail, setOpenDetail] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    return (
        <Box>
            {permissions.includes('order.view') && (
                <Button
                    size={'small'}
                    sx={{ fontSize: 12, p: 0, textTransform: 'capitalize' }}
                    onClick={() => setOpenDetail(true)}>
                    {t('table.view')}
                </Button>
            )}
            {permissions.includes('order.delete') && (
                <Button
                    color={'error'}
                    size={'small'}
                    sx={{ fontSize: 12, p: 0, textTransform: 'capitalize' }}
                    onClick={() => setOpenDelete(true)}>
                    {t('table.delete')}
                </Button>
            )}
            {/* View Order Dialog */}
            <ModalViewOrderDetail
                open={openDetail}
                setOpen={setOpenDetail}
                data={data}
            />
            {/** Delete Order */}
            <ModalDeleteOrder
                open={openDelete}
                data={data}
                setOpen={setOpenDelete}
            />
        </Box>
    );
};

export default RowActions;
