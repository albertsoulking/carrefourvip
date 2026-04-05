import { Typography } from '@mui/material';
import RowActions from './RowActions';
import RowAvatar from './RowAvatar';
import RowStatus from './RowStatus';
import dayjs from 'dayjs';

const getColumns = () => {

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
            field: 'imageUrl',
            headerName: '图片',
            width: 70,
            renderCell: (params) => <RowAvatar imageUrl={params.value} />
        },
        {
            field: 'price',
            headerName: '价格 (€)',
            width: 100,
            renderCell: (params) => (
                <Typography fontSize={12}>
                    {Number(params.value).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </Typography>
            )
        },
        {
            field: 'soldCount',
            headerName: '销量',
            width: 100,
            renderCell: (params) => (
                <Typography fontSize={12}>{params.value}</Typography>
            )
        },
        {
            field: 'category.id',
            headerName: '品类',
            width: 160,
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {params.row.category.name}
                </Typography>
            )
        },
        {
            field: 'isAvailable',
            headerName: '状态',
            width: 100,
            renderCell: (params) => (
                <RowStatus
                    id={params.id}
                    status={Boolean(params.value)}
                />
            )
        },
        {
            field: 'createdAt',
            headerName: '添加时间',
            width: 160,
            renderCell: (params) => (
                <Typography fontSize={12}>
                    {dayjs(params.value).format('YYYY-MM-DD HH:mm:ss')}
                </Typography>
            )
        }
    ];
};

export default getColumns;
