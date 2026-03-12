import { Typography, Chip } from '@mui/material';
import RowActions from './RowActions';
import RowMode from './RowMode';
import dayjs from 'dayjs';

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
        width: 80,
        renderCell: (params) => <RowActions data={params.row} />
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
        field: 'user.name',
        headerName: '名称',
        width: 120,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.row.user.name}
            </Typography>
        )
    },

    {
        field: 'subject',
        headerName: '标题',
        width: 200,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.value}
            </Typography>
        )
    },

    {
        field: 'deletedAt',
        headerName: '删除时间',
        width: 140,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {dayjs(params.value).format('YYYY-MM-DD HH:mm:ss')}
            </Typography>
        )
    }
];

export default getColumns;
