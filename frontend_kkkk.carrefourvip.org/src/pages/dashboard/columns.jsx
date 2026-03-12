import { Chip, Typography } from '@mui/material';
import RowOrderStatus from './RowOrderStatus';
import RowPaymentStatus from './RowPaymentStatus';
import RowPayMethod from './RowPayMethod';
import RowDeliveryMethod from './RowDeliveryMethod';
import RowMode from './RowMode';
import RowAvatar from './RowAvatar';

const getColumns = ({ t }) => [
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
        field: 'id',
        headerName: t('table.orderId'),
        width: 70,
        renderCell: (params) => (
            <Typography fontSize={12}>{params.value}</Typography>
        )
    },
    {
        field: 'createdAt',
        headerName: t('table.createdAt.order'),
        width: 140,
        renderCell: (params) => (
            <Typography fontSize={12}>{params.value}</Typography>
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
                {params.value}
            </Typography>
        )
    },
    {
        field: 'parentName',
        headerName: t('parent.name'),
        width: 80,
        renderCell: (params) => (
            <Chip
                label={params.value}
                size={'small'}
                color={'info'}
                sx={{ cursor: 'pointer', fontSize: 12 }}
                onClick={() => {}}
            />
        )
    },
    {
        field: 'userMode',
        headerName: t('table.mode'),
        width: 100,
        renderCell: (params) => (
            <RowMode
                status={params.value}
                t={t}
            />
        )
    },
    {
        field: 'userName',
        headerName: t('table.name'),
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
        field: 'userEmail',
        headerName: t('table.email'),
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
        width: 100,
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
        width: 100,
        renderCell: (params) => (
            <RowPaymentStatus
                status={params.value}
                t={t}
            />
        )
    }
];

export default getColumns;
