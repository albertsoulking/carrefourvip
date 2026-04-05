import { Chip, Typography } from '@mui/material';
import RowDirection from './RowDirection';
import RowPayMethod from './RowPayMethod';
import RowType from './RowType';
import RowStatus from './RowStatus';
import RowMode from './RowMode';

const getColumns = () => [
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
        headerName: 'ID',
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
        field: 'parent.name',
        headerName: '上级',
        width: 80,
        renderCell: (params) => (
            <Chip
                label={
                    params.row.user.parent ? params.row.user.parent.name : '-'
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
        headerName: '账号类型',
        width: 100,
        renderCell: (params) => <RowMode status={params.row.user.mode} />
    },
    {
        field: 'user.email',
        headerName: '登录账号',
        width: 160,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.row.user.email}
            </Typography>
        )
    },
    {
        field: 'amount',
        headerName: '金额 (€)',
        width: 80,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.value}
            </Typography>
        )
    },
    {
        field: 'postBalance',
        headerName: '余额变化 (€)',
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
        field: 'transactionNumber',
        headerName: '交易编号',
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
        field: 'order.id',
        headerName: '订单编号',
        width: 80,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.row.order ? params.row.order.id : '-'}
            </Typography>
        )
    },
    {
        field: 'direction',
        headerName: '方向',
        width: 60,
        renderCell: (params) => <RowDirection status={params.value} />
    },
    {
        field: 'method',
        headerName: '方式',
        width: 90,
        renderCell: (params) => <RowPayMethod status={params.value} />
    },
    {
        field: 'type',
        headerName: '类型',
        width: 100,
        renderCell: (params) => <RowType status={params.value} />
    },
    {
        field: 'status',
        headerName: '状态',
        width: 80,
        renderCell: (params) => <RowStatus status={params.value} />
    },
    {
        field: 'createdAt',
        headerName: '创建时间',
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

export default getColumns;
