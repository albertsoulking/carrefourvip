import { FileCopyRounded } from '@mui/icons-material';
import { Box, Typography, Tooltip, IconButton, Chip } from '@mui/material';
import RowActions from './RowActions';
import RowOrderStatus from './RowOrderStatus';
import RowPaymentStatus from './RowPaymentStatus';
import RowPayMethod from './RowPayMethod';
import RowDeliveryMethod from './RowDeliveryMethod';
import RowMode from './RowMode';
import RowAvatar from './RowAvatar';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import usePermissionStore from '../../hooks/usePermissionStore';

const getColumns = ({
    updateData
}) => {
    const permissions = usePermissionStore((state) => state.permissions);
    const { t } = useTranslation();

    return [
        {
            field: 'serial',
            headerName: '序号',
            sortable: false,
            width: 50,
            renderCell: (params) => {
                const rowIndex = params.api.getAllRowIds().indexOf(params.id);
                const page = params.api.state.pagination.paginationModel.page;
                const pageSize =
                    params.api.state.pagination.paginationModel.pageSize;

                return (
                    <Typography
                        fontSize={12}
                        noWrap>
                        {page * pageSize + rowIndex + 1}
                    </Typography>
                );
            }
        },
        {
            field: 'actions',
            headerName: t('table.actions'),
            width: 80,
            renderCell: (params) => (
                <RowActions
                    data={params.row}
                />
            )
        },
        {
            field: 'id',
            headerName: t('table.orderId'),
            width: 100,
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'user.id',
            headerName: t('user.id'),
            width: 70,
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {params.row.user?.id}
                </Typography>
            )
        },
        {
            field: 'parent.name',
            headerName: t('parent.name'),
            width: 80,
            renderCell: (params) => (
                <Chip
                    label={
                        params.row.user?.parent
                            ? params.row.user.parent.name
                            : '-'
                    }
                    size={'small'}
                    color={'info'}
                    sx={{ cursor: 'pointer', fontSize: 12 }}
                    onClick={() => {}}
                />
            )
        },
        {
            field: 'user.mode',
            headerName: t('table.userMode'),
            width: 70,
            renderCell: (params) => (
                <RowMode
                    status={params.row.user?.mode}
                    t={t}
                />
            )
        },
        {
            field: 'createdAt',
            headerName: t('table.createdAt.order'),
            width: 90,
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {moment(params.value).format('M/D H:mm')}
                </Typography>
            )
        },
        {
            field: 'paidAt',
            headerName: t('table.paidAt'),
            width: 90,
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {params.value
                        ? moment(params.value).format('M/D H:mm')
                        : ''}
                </Typography>
            )
        },
        {
            field: 'imageUrl',
            headerName: t('table.imageUrl'),
            width: 80,
            renderCell: (params) => <RowAvatar imageUrl={params.value} />
        },
        {
            field: 'quantity',
            headerName: t('table.quantity'),
            width: 70,
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'payAmount',
            headerName: t('table.payAmount'),
            width: 90,
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'deliveryMethod',
            headerName: t('table.deliveryMethod'),
            width: 100,
            renderCell: (params) => (
                <RowDeliveryMethod
                    status={params.value}
                    onChange={(newStatus) =>
                        updateData({ ...params.row, deliveryMethod: newStatus })
                    }
                />
            )
        },
        {
            field: 'payMethod',
            headerName: t('table.payMethod'),
            width: 100,
            renderCell: (params) => (
                <RowPayMethod
                    status={params.value}
                    onChange={(newStatus) =>
                        updateData({ ...params.row, payMethod: newStatus })
                    }
                />
            )
        },
        {
            field: 'status',
            headerName: t('table.status.order'),
            width: 90,
            renderCell: (params) => (
                <RowOrderStatus
                    status={params.value}
                    onChange={(newStatus) =>
                        updateData({ ...params.row, status: newStatus })
                    }
                />
            )
        },
        {
            field: 'paymentStatus',
            headerName: t('table.paymentStatus'),
            width: 90,
            renderCell: (params) => (
                <RowPaymentStatus
                    status={params.value}
                    onChange={(newStatus) =>
                        updateData({ ...params.row, paymentStatus: newStatus })
                    }
                />
            )
        },
        {
            field: 'paymentLink',
            headerName: t('table.paymentLink'),
            width: 200,
            editable: permissions.includes('order.setPaymentLink'),
            renderCell: (params) => (
                <Box
                    display={'flex'}
                    alignItems={'center'}>
                    <Tooltip
                        title={t('table.clickToCopy')}
                        placement={'top'}
                        arrow>
                        <IconButton
                            size={'small'}
                            color={'action'}
                            onClick={() =>
                                navigator.clipboard.writeText(params.value)
                            }>
                            <FileCopyRounded fontSize={'inherit'} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        title={params.value}
                        placement={'top'}
                        arrow>
                        <Typography
                            fontSize={12}
                            color={'primary'}
                            fontWeight={'bold'}
                            noWrap>
                            {params.value}
                        </Typography>
                    </Tooltip>
                </Box>
            )
        },
        {
            field: 'shareLink',
            headerName: t('table.shareLink'),
            width: 200,
            renderCell: (params) => (
                <Box
                    display={'flex'}
                    alignItems={'center'}>
                    <Tooltip
                        title={t('table.clickToCopy')}
                        placement={'top'}
                        arrow>
                        <IconButton
                            size={'small'}
                            color={'action'}
                            onClick={() =>
                                navigator.clipboard.writeText(params.value)
                            }>
                            <FileCopyRounded fontSize={'inherit'} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        title={params.value}
                        placement={'top'}
                        arrow>
                        <Typography
                            fontSize={12}
                            color={'primary'}
                            fontWeight={'bold'}
                            noWrap>
                            {params.value}
                        </Typography>
                    </Tooltip>
                </Box>
            )
        }
    ];
};

export default getColumns;
