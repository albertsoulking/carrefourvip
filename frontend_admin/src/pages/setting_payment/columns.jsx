import { Typography, Switch } from '@mui/material';
import RowActions from './RowActions';
import RowAvatar from './RowAvatar';
import RowStatus from './RowStatus';
import RowManual from './RowManual';
import RowVisible from './RowVisible';
import RowConfig from './RowConfig';

const getColumns = ({
    updateData,
    permissions,
    setOpenDeleteModal,
    setOpenUpdateModal,
    setOpenDetailModal
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
        field: 'id',
        headerName: 'ID',
        width: 70,
        renderCell: (params) => (
            <Typography fontSize={12}>{params.value}</Typography>
        )
    },
    {
        field: 'actions',
        headerName: '操作',
        width: 100,
        renderCell: (params) => (
            <RowActions
                data={params.row}
                setOpenDeleteModal={setOpenDeleteModal}
                permissions={permissions}
                setOpenUpdateModal={setOpenUpdateModal}
                setOpenDetailModal={setOpenDetailModal}
            />
        )
    },
    {
        field: 'logo',
        headerName: '图标',
        width: 70,
        renderCell: (params) => <RowAvatar imageUrl={params.value} />
    },
    {
        field: 'name',
        headerName: '名称',
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
        field: 'provider.name',
        headerName: '供应商',
        width: 100,
        renderCell: (params) => (
            <Typography
                fontSize={12}
                noWrap>
                {params.row.provider.name}
            </Typography>
        )
    },
    {
        field: 'status',
        headerName: '状态',
        width: 100,
        editable: true,
        renderCell: (params) => (
            <RowStatus
                status={params.value}
                onChange={(newValue) =>
                    updateData({ ...params.row, status: newValue })
                }
            />
        )
    },
    {
        field: 'sortOrder',
        headerName: '排序',
        width: 70,
        editable: true,
        renderCell: (params) => (
            <Typography fontSize={12}>{params.value}</Typography>
        )
    },
    {
        field: 'discount',
        headerName: '优惠 %',
        width: 70,
        editable: true,
        renderCell: (params) => (
            <Typography fontSize={12}>{params.value}</Typography>
        )
    },
    {
        field: 'isManual',
        headerName: '支付形式',
        width: 100,
        editable: true,
        renderCell: (params) => (
            <RowManual
                status={params.value}
                onChange={(newValue) =>
                    updateData({ ...params.row, isManual: newValue })
                }
            />
        )
    },
    {
        field: 'visible',
        headerName: '前端显示',
        width: 100,
        editable: true,
        renderCell: (params) => (
            <RowVisible
                status={params.value}
                onChange={(newValue) =>
                    updateData({ ...params.row, visible: newValue })
                }
            />
        )
    },
    {
        field: 'config',
        headerName: '配置',
        width: 70,
        renderCell: (params) => (
            <RowConfig
                data={params.value}
                id={params.id}
                gatewayName={params.row.name}
            />
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

export default getColumns;
