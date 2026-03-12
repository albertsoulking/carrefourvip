import { Chip, Typography } from '@mui/material';
import RowAvatar from './RowAvatar';
import RowMode from './RowMode';
import RowType from './RowType';

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
        field: 'user.id',
        headerName: '客户ID',
        width: 100,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.row.user?.id}
            </Typography>
        )
    },
    {
        field: 'userParent.name',
        headerName: '上级',
        width: 100,
        renderCell: (params) => (
            <Chip
                label={
                    params.row.user?.parent ? params.row.user.parent.name : '-'
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
        renderCell: (params) => <RowMode status={params.row.user?.mode} />
    },
    {
        field: 'user.avatar',
        headerName: '客户头像',
        width: 100,
        renderCell: (params) => <RowAvatar imageUrl={params.row.user?.avatar} />
    },
    {
        field: 'user.name',
        headerName: '客户名称',
        width: 120,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.row.user?.name}
            </Typography>
        )
    },
    {
        field: 'user.email',
        headerName: '登录账号',
        width: 140,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.row.user?.email}
            </Typography>
        )
    },
    {
        field: 'user.remark',
        headerName: '备注信息',
        width: 140,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.row.user?.remark}
            </Typography>
        )
    },
    {
        field: 'type',
        headerName: '登录/登出',
        width: 100,
        renderCell: (params) => <RowType status={params.value} />
    },
    {
        field: 'ip',
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
        field: 'browser',
        headerName: '浏览器',
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
        field: 'device',
        headerName: '设备',
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
        field: 'os',
        headerName: '操作系统',
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
        field: 'city',
        headerName: '登录/登出城市',
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
        headerName: '登录/登出邮编',
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
        headerName: '登录/登出州/省',
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
        field: 'country',
        headerName: '登录/登出国家',
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
        field: 'createdAt',
        headerName: '登录/登出时间',
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
