import { Typography, Switch, Chip } from '@mui/material';

const getColumnMembers = () => [
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
            <Typography fontSize={12}>{params.value}</Typography>
        )
    },
    {
        field: 'parent.id',
        headerName: '上级',
        width: 100,
        renderCell: (params) => (
            <Chip
                label={params.row.parent?.name ?? '-'}
                size={'small'}
                color={'info'}
                sx={{ cursor: 'pointer', fontSize: 12 }}
                onClick={() => {}}
            />
        )
    },
    {
        field: 'name',
        headerName: '名称',
        width: 100,
        renderCell: (params) => (
            <Typography fontSize={12}>{params.value}</Typography>
        )
    },
    {
        field: 'email',
        headerName: '账号',
        width: 160,
        renderCell: (params) => (
            <Typography fontSize={12}>{params.value}</Typography>
        )
    },
    {
        field: 'status',
        headerName: '状态',
        width: 70,
        renderCell: (params) => (
            <Switch
                checked={Boolean(params.value)}
                size={'small'}
            />
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
        field: 'lastLoginAt',
        headerName: '最后上线时间',
        width: 130,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.value ? new Date(params.value).toLocaleString() : '-'}
            </Typography>
        )
    },
    {
        field: 'createdAt',
        headerName: '创建时间',
        width: 160,
        sortable: true,
        filterable: true,
        renderCell: (params) => (
            <Typography fontSize={12}>
                {new Date(params.value).toLocaleString()}
            </Typography>
        )
    }
];

export default getColumnMembers;
