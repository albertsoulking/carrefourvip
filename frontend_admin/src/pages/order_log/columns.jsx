import { Typography } from '@mui/material';
import { useTranslation } from '../../../node_modules/react-i18next';

const getColumns = () => {
    const { t } = useTranslation();

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
            field: 'id',
            headerName: t('table.id'),
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
            headerName: t('table.createdAt.log'),
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
            field: 'user.name',
            headerName: t('table.operator'),
            width: 80,
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {params.row.user?.name}
                </Typography>
            )
        },
        {
            field: 'action',
            headerName: t('table.action'),
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
            headerName: t('table.targetType'),
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
            headerName: t('table.targetId'),
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
            headerName: t('table.logIp'),
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
            headerName: t('table.city'),
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
            headerName: t('table.zipCode'),
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
            headerName: t('table.state'),
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
            headerName: t('table.country'),
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
            headerName: t('table.description'),
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
};

export default getColumns;
