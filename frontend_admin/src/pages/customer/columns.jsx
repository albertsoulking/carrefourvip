import { Typography } from '@mui/material';
import RowActions from './RowActions';
import RowParent from './RowParent';
import RowMode from './RowMode';
import usePermissionStore from '../../hooks/usePermissionStore';
import { useTranslation } from 'react-i18next';
import RowStatus from './RowStatus';

const getColumns = () => {
    const { t } = useTranslation();
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
            headerName: t('table.actions'),
            sortable: false,
            width: 130,
            renderCell: (params) => <RowActions data={params.row} />
        },
        {
            field: 'id',
            headerName: t('table.userId'),
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
            field: 'parent.name',
            headerName: t('parent.name'),
            width: 100,
            renderCell: (params) => (
                <RowParent value={params.row.parent?.name} />
            )
        },
        {
            field: 'mode',
            headerName: t('table.mode'),
            width: 100,
            renderCell: (params) => <RowMode status={params.value} />
        },
        {
            field: 'name',
            headerName: t('table.name'),
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
            headerName: t('table.amount'),
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
            field: 'point',
            headerName: t('table.point'),
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
            field: 'totalOrders',
            headerName: '下单数',
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
            field: 'totalRevenue',
            headerName: '消费额 (€)',
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
            field: 'status',
            headerName: t('table.status.user'),
            width: 70,
            renderCell: (params) => <RowStatus status={Boolean(params.value)} />
        },
        {
            field: 'remark',
            headerName: t('table.remark'),
            width: 160,
            editable: permissions.includes('customer.setRemark'),
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
            headerName: t('table.country'),
            width: 120,
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {params.value}
                </Typography>
            )
        }
    ];
};

export default getColumns;
