import { Typography } from '@mui/material';
import RowActions from './RowActions';
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
        width: 100,
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
        field: 'name',
        headerName: '名称',
        width: 160,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.value}
            </Typography>
        )
    },
    {
        field: 'vatPercent',
        headerName: '增值税 (%)',
        width: 100,
        renderCell: (params) => (
            <Typography fontSize={12}>{params.value}</Typography>
        )
    },
    {
        field: 'deletedAt',
        headerName: '删除时间',
        width: 160,
        renderCell: (params) => (
            <Typography fontSize={12}>
                {dayjs(params.value).format('YYYY-MM-DD HH:mm:ss')}
            </Typography>
        )
    }
];

export default getColumns;
