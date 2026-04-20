import { Chip, Typography } from '@mui/material';
import RowActions from './RowActions';
import RowStatus from './RowStatus';

function formatDateTime(value) {
    if (!value) return '-';

    return new Date(value).toLocaleString();
}

function getStatusColor(status) {
    const mapping = {
        submitted: 'default',
        processing: 'warning',
        confirmed: 'success',
        cancelled: 'error'
    };

    return mapping[status] || 'default';
}

const getColumns = ({
    updateData
}) => [
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
        headerName: '操作',
        width: 70,
        sortable: false,
        renderCell: (params) => <RowActions data={params.row} />
    },
    {
        field: 'bookingReference',
        headerName: '预订编号',
        width: 180,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.value}
            </Typography>
        )
    },
    {
        field: 'user.name',
        headerName: '会员',
        width: 120,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.row.user?.name || '-'}
            </Typography>
        )
    },
    {
        field: 'user.email',
        headerName: '会员邮箱',
        width: 180,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.row.user?.email || '-'}
            </Typography>
        )
    },
    {
        field: 'contactName',
        headerName: '联系人',
        width: 140,
        sortable: false,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.row.contactFirstName} {params.row.contactLastName}
            </Typography>
        )
    },
    {
        field: 'contactPhone',
        headerName: '联系电话',
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
        field: 'airlineCode',
        headerName: '航司',
        width: 90,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.row.airlineName || params.value}
            </Typography>
        )
    },
    {
        field: 'route',
        headerName: '航线',
        width: 120,
        sortable: false,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.row.originCode} - {params.row.destinationCode}
            </Typography>
        )
    },
    {
        field: 'departureAt',
        headerName: '出发时间',
        width: 160,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {formatDateTime(params.value)}
            </Typography>
        )
    },
    {
        field: 'passengerCount',
        headerName: '人数',
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
        field: 'price',
        headerName: '金额',
        width: 90,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                USD {Number(params.value || 0).toFixed(2)}
            </Typography>
        )
    },
    {
        field: 'status',
        headerName: '状态',
        width: 110,
        renderCell: (params) => (
            <RowStatus
                status={params.value}
                onChange={(newStatus) =>
                    updateData({ ...params.row, status: newStatus })
                }
            />
        )
    },
    {
        field: 'paymentLink',
        headerName: '支付链接',
        width: 90,
        editable: true,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.value}
            </Typography>
        )
    },
    {
        field: 'createdAt',
        headerName: '提交时间',
        width: 160,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {formatDateTime(params.value)}
            </Typography>
        )
    }
];

export default getColumns;
