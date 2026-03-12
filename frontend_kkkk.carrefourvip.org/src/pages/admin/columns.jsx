import {
    Box,
    IconButton,
    Typography,
    Tooltip,
    Switch
} from '@mui/material';
import RowActions from './RowActions';
import { FileCopyRounded } from '@mui/icons-material';
import RowParent from './RowParent';
import RowRole from './RowRole';
import usePermissionStore from '../../hooks/usePermissionStore';
import ButtonMember from './ButtonMember';

const getColumns = ({
    updateData,
    adminsData,
    onChangeRole
}) => {
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
            field: 'parent.id',
            headerName: '上级',
            width: 100,
            renderCell: (params) => (
                <RowParent
                    value={params.row.parent?.name}
                    data={adminsData}
                    onChange={(newValue) =>
                        updateData({ ...params.row, parentId: newValue })
                    }
                />
            )
        },
        {
            field: 'role.id',
            headerName: '角色',
            width: 100,
            renderCell: (params) => (
                <RowRole
                    status={params.row.role?.name}
                    onChange={(newValue) =>
                        onChangeRole({
                            id: params.row.id,
                            roleName: newValue
                        })
                    }
                />
            )
        },
        {
            field: 'name',
            headerName: '名称',
            width: 100,
            editable: permissions.includes('admin.editName'),
            renderCell: (params) => (
                <Typography fontSize={12}>{params.value}</Typography>
            )
        },
        {
            field: 'email',
            headerName: '账号',
            width: 160,
            editable: permissions.includes('admin.changeEmail'),
            renderCell: (params) => (
                <Typography fontSize={12}>{params.value}</Typography>
            )
        },
        {
            field: 'status',
            headerName: '状态',
            width: 70,
            renderCell: (params) => (
                <Switch
                    checked={Boolean(params.value)}
                    size={'small'}
                    onChange={(e) => {
                        if (permissions.includes('admin.changeStatus'))
                            updateData({
                                ...params.row,
                                status: e.target.checked
                            });
                    }}
                />
            )
        },
        {
            field: 'referralCode',
            headerName: '邀请码',
            width: 120,
            editable: permissions.includes('admin.changeReferralCode'),
            renderCell: (params) => (
                <Box
                    display={'flex'}
                    alignItems={'center'}>
                    <Tooltip
                        title={'点击复制链接'}
                        placement={'top'}
                        arrow>
                        <IconButton
                            size={'small'}
                            onClick={() =>
                                navigator.clipboard.writeText(
                                    `${
                                        import.meta.env.VITE_HOST_BASE_URL
                                    }?ref=${params.value}`
                                )
                            }>
                            <FileCopyRounded fontSize={'inherit'} />
                        </IconButton>
                    </Tooltip>
                    <Typography
                        fontSize={12}
                        color={'primary'}
                        fontWeight={'bold'}>
                        {params.value}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'agentMember',
            headerName: '代理数量',
            width: 80,
            renderCell: (params) => (
                <ButtonMember
                    value={params.value}
                    data={params.row}
                    roleName={'agent'}
                />
            )
        },
        {
            field: 'headMember',
            headerName: '团长数量',
            width: 80,
            renderCell: (params) => (
                <ButtonMember
                    value={params.value}
                    data={params.row}
                    roleName={'head'}
                />
            )
        },
        {
            field: 'teamMember',
            headerName: '组员数量',
            width: 80,
            renderCell: (params) => (
                <ButtonMember
                    value={params.value}
                    data={params.row}
                    roleName={'team'}
                />
            )
        },
        {
            field: 'customerMember',
            headerName: '客户数量',
            width: 80,
            renderCell: (params) => (
                <ButtonMember
                    value={params.value}
                    data={params.row}
                    roleName={'customer'}
                />
            )
        },
        {
            field: 'remark',
            headerName: '备注',
            width: 160,
            editable: permissions.includes('admin.setRemark'),
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {params.value || '-'}
                </Typography>
            )
        },
        {
            field: 'lastLoginAt',
            headerName: '最后上线时间',
            width: 130,
            renderCell: (params) => (
                <Typography
                    fontSize={12}
                    noWrap>
                    {params.value
                        ? new Date(params.value).toLocaleString()
                        : '-'}
                </Typography>
            )
        },
        {
            field: 'createdAt',
            headerName: '创建时间',
            width: 160,
            sortable: true,
            filterable: true,
            renderCell: (params) => (
                <Typography fontSize={12}>
                    {new Date(params.value).toLocaleString()}
                </Typography>
            )
        }
    ];
};

export default getColumns;
