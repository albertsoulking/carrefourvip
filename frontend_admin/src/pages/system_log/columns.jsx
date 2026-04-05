import { Typography } from '@mui/material';

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
        field: 'createdAt',
        headerName: '操作时间',
        width: 140,
        sortable: true,
        filterable: true,
        renderCell: (params) => (
            <Typography fontSize={12}>
                {new Date(params.value).toLocaleString()}
            </Typography>
        )
    },
    {
        field: 'admin.name',
        headerName: '操作人',
        width: 80,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.row.admin?.name}
            </Typography>
        )
    },
    {
        field: 'action',
        headerName: '动作',
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
        field: 'targetType',
        headerName: '对象类型',
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
        field: 'targetId',
        headerName: '对象 ID',
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
        field: 'ipAddress',
        headerName: 'IP 地址',
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
        field: 'city',
        headerName: '城市',
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
        field: 'zipCode',
        headerName: '邮编',
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
        field: 'state',
        headerName: '州/省',
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
        field: 'country',
        headerName: '国家',
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
        field: 'description',
        headerName: '描述',
        width: 700,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.value}
            </Typography>
        )
    }
];

export default getColumns;
