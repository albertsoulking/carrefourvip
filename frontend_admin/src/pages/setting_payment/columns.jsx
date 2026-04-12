import { Typography, Switch } from '@mui/material';
import RowActions from './RowActions';
import RowAvatar from './RowAvatar';
import RowStatus from './RowStatus';
import RowManual from './RowManual';
import RowVisible from './RowVisible';
import RowConfig from './RowConfig';
import i18n from '../../config/i18n';

const getColumns = ({
    updateData,
    permissions,
    setOpenDeleteModal,
    setOpenUpdateModal,
    setOpenDetailModal
}) => [
    {
        field: 'serial',
        headerName: i18n.t('settingPayment.columns.serial'),
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
        headerName: i18n.t('table.actions'),
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
        headerName: i18n.t('settingPayment.columns.logo'),
        width: 70,
        renderCell: (params) => <RowAvatar imageUrl={params.value} />
    },
    {
        field: 'name',
        headerName: i18n.t('table.name'),
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
        headerName: i18n.t('settingPayment.fields.provider'),
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
        headerName: i18n.t('table.status.user'),
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
        headerName: i18n.t('settingPayment.columns.sortOrder'),
        width: 70,
        editable: true,
        renderCell: (params) => (
            <Typography fontSize={12}>{params.value}</Typography>
        )
    },
    {
        field: 'discount',
        headerName: i18n.t('settingPayment.columns.discount'),
        width: 70,
        editable: true,
        renderCell: (params) => (
            <Typography fontSize={12}>{params.value}</Typography>
        )
    },
    {
        field: 'isManual',
        headerName: i18n.t('settingPayment.columns.paymentMode'),
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
        headerName: i18n.t('settingPayment.columns.frontendVisible'),
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
        headerName: i18n.t('settingPayment.columns.config'),
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
        headerName: i18n.t('settingPayment.columns.createdAt'),
        width: 160,
        renderCell: (params) => (
            <Typography fontSize={12}>
                {new Date(params.value).toLocaleString()}
            </Typography>
        )
    }
];

export default getColumns;
