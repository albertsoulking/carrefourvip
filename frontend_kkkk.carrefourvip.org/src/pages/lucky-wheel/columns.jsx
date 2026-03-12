import { Typography } from '@mui/material';
import RowActions from './RowActions';
import { useTranslation } from 'react-i18next';

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
            field: 'actions',
            headerName: t('table.actions'),
            width: 130,
            renderCell: (params) => <RowActions />
        },
        {
            field: 'id',
            headerName: t('table.userId'),
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
            field: 'createdAt',
            headerName: t('table.createdAt.user'),
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
};

export default getColumns;
