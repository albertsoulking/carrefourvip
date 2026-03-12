import { Typography } from '@mui/material';
import RowActions from './RowActions';
import RowAvatar from './RowAvatar';
import RowStatus from './RowStatus';
import RowCollect from './RowCollect';
import usePermissionStore from '../../hooks/usePermissionStore';

const getColumns = () => {
    const permissions = usePermissionStore((state) => state.permissions);

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
            renderCell: (params) => (
                <RowActions
                    data={params.row}
                />
            )
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
            editable: permissions.includes('category.editName'),
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
            field: 'bgImageUrl',
            headerName: '背景图',
            width: 70,
            renderCell: (params) => <RowAvatar imageUrl={params.value} />
        },
        {
            field: 'description',
            headerName: '描述',
            width: 160,
            editable: permissions.includes('category.editDescription'),
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {params.value}
                </Typography>
            )
        },

        {
            field: 'isActive',
            headerName: '是否启用',
            width: 100,
            renderCell: (params) => (
                <RowStatus
                    id={params.id}
                    status={Boolean(params.value)}
                />
            )
        },
        {
            field: 'displayOrder',
            headerName: '显示顺序',
            width: 100,
            editable: permissions.includes('category.editDisplayOrder'),
            renderCell: (params) => (
                <Typography fontSize={12}>{params.value}</Typography>
            )
        },
        // {
        //     field: 'parentId',
        //     headerName: '上级',
        //     width: 70,
        //     renderCell: (params) => <Typography fontSize={12}>-</Typography>
        // },
        {
            field: 'vatPercent',
            headerName: '增值税 (%)',
            width: 100,
            editable: permissions.includes('category.editVatPercent'),
            renderCell: (params) => (
                <Typography fontSize={12}>{params.value}</Typography>
            )
        },
        {
            field: 'isCollect',
            headerName: '是否收税',
            width: 100,
            renderCell: (params) => (
                <RowCollect
                    id={params.id}
                    status={Boolean(params.value)}
                />
            )
        },
        {
            field: 'productCount',
            headerName: '商品数量',
            width: 160,
            renderCell: (params) => (
                <Typography fontSize={12}>{params.value}</Typography>
            )
        },
        {
            field: 'createdAt',
            headerName: '添加时间',
            width: 160,
            renderCell: (params) => (
                <Typography fontSize={12}>
                    {new Date(params.value).toLocaleString()}
                </Typography>
            )
        }
    ];
};

export default getColumns;
