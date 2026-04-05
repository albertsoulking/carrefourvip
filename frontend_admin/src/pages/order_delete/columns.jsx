import { Typography, Chip } from '@mui/material';
import RowActions from './RowActions';
import RowOrderStatus from './RowOrderStatus';
import RowPaymentStatus from './RowPaymentStatus';
import RowPayMethod from './RowPayMethod';
import RowDeliveryMethod from './RowDeliveryMethod';
import RowAvatar from './RowAvatar';
import { useTranslation } from '../../../node_modules/react-i18next';

const getColumns = () => {
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
            renderCell: (params) => <RowActions data={params.row} />
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
            field: 'parent.name',
            headerName: t('parent.name'),
            width: 80,
            renderCell: (params) => (
                <Chip
                    label={
                        params.row.user.parent
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
            field: 'createdAt',
            headerName: t('table.createdAt.order'),
            width: 140,
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {new Date(params.value).toLocaleString()}
                </Typography>
            )
        },
        {
            field: 'paidAt',
            headerName: t('table.paidAt'),
            width: 140,
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {params.value
                        ? new Date(params.value).toLocaleString()
                        : ''}
                </Typography>
            )
        },
        {
            field: 'user.email',
            headerName: t('table.email'),
            width: 140,
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {params.row.user.email}
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
                    t={t}
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
                    t={t}
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
                    t={t}
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
                    t={t}
                />
            )
        },
        {
            field: 'deletedAt',
            headerName: t('table.deletedAt'),
            width: 140,
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {new Date(params.value).toLocaleString()}
                </Typography>
            )
        }
    ];
};

export default getColumns;
