import { Typography } from '@mui/material';
import RowActions from './RowActions';
import RowParent from './RowParent';

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
        field: 'actions',
        headerName: '操作',
        width: 100,
        renderCell: (params) => <RowActions data={params.row} />
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
        width: 100,
        renderCell: (params) => <RowParent value={params.row.parent?.name} />
    },
    {
        field: 'name',
        headerName: '名称',
        width: 120,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.value}
            </Typography>
        )
    },
    {
        field: 'balance',
        headerName: '余额 (€)',
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
        field: 'remark',
        headerName: '备注',
        width: 160,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.value || '-'}
            </Typography>
        )
    },

    {
        field: 'country',
        headerName: '国家',
        width: 120,
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
        headerName: '注册时间',
        width: 130,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {new Date(params.value).toLocaleString()}
            </Typography>
        )
    },
    {
        field: 'deletedAt',
        headerName: '删除时间',
        width: 130,
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
