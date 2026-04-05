import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import getColumnMembers from './columnMembers';

const ModalViewMember = ({ open, data, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const [sortModel, setSortModel] = useState([{ field: 'id', sort: 'asc' }]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10
    });
    const [fetchData, setFetchData] = useState({
        data: [],
        total: 0,
        page: 1,
        lastPage: 0
    });
    const [searchModal, setSearchModal] = useState({
        page: 1,
        limit: 10,
        orderBy: 'desc',
        sortBy: 'id'
    });

    useEffect(() => {
        if (!open) return;
        if (!data) return;

        loadData({
            ...searchModal,
            adminId: data?.id.toString(),
            roleName: data?.roleName
        });
    }, [open]);

    const loadData = async (payload) => {
        setLoading(true);
        setSearchModal(payload);

        const res = await api.agent.getMembers(payload);
        setFetchData(res.data);
        setLoading(false);
    };

    const handleOnClose = () => {
        setOpen(false);
        setSortModel([{ field: 'id', sort: 'asc' }]);
        setPaginationModel({ page: 0, pageSize: 10 });
        setSearchModal({
            page: 1,
            limit: 10,
            orderBy: 'desc',
            sortBy: 'id'
        });
    };

    return (
        <Dialog
            open={open}
            maxWidth={'xl'}
            fullWidth
            container={document.body}
            disablePortal={false}>
            <DialogTitle>
                {data?.name} 的
                {data?.roleName === 'agent'
                    ? '代理'
                    : data?.roleName === 'head'
                    ? '团长'
                    : data?.roleName === 'team'
                    ? '组员'
                    : data?.roleName === 'customer'
                    ? '客户'
                    : ''}
                成员
            </DialogTitle>
            <DialogContent dividers>
                <DataGrid
                    sortingOrder={['asc', 'desc']}
                    sortingMode={'server'}
                    filterMode={'server'}
                    sortModel={sortModel}
                    onSortModelChange={(model) => {
                        const sorting = model[0];

                        setSortModel(model);
                        loadData({
                            ...searchModal,
                            orderBy: sorting.sort,
                            sortBy: sorting.field
                        });
                    }}
                    processRowUpdate={async (newRow, oldRow) => {
                        try {
                            const updatedRow = {
                                ...newRow,
                                parentId: newRow.parent?.id ?? null
                            };

                            return updatedRow;
                        } catch (err) {
                            throw err;
                        }
                    }}
                    onProcessRowUpdateError={(error) => {
                        enqueueSnackbar(error, {
                            variant: 'error'
                        });
                    }}
                    rows={fetchData.data}
                    columns={getColumnMembers()}
                    getRowHeight={() => 'auto'}
                    disableColumnFilter
                    disableColumnMenu
                    disableSelectionOnClick
                    loading={loading}
                    pageSize={searchModal.limit}
                    pagination
                    paginationMode={'server'}
                    rowCount={fetchData.total}
                    paginationModel={paginationModel}
                    onPaginationModelChange={(model) => {
                        setPaginationModel(model);
                        loadData({
                            ...searchModal,
                            page: model.page + 1,
                            limit: model.pageSize
                        });
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    sx={{
                        border: 0,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        '& .MuiDataGrid-columnHeaders': {
                            fontSize: 12
                        },
                        '& .MuiDataGrid-virtualScroller': {
                            minHeight: '200px'
                        },
                        '& .MuiDataGrid-footerContainer': {},
                        '& .MuiDataGrid-cell': {
                            display: 'flex',
                            alignItems: 'center',
                            py: 0.5
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant={'outlined'}
                    color={'default'}
                    size={'small'}
                    sx={{ width: 100 }}
                    onClick={handleOnClose}>
                    关闭
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalViewMember;
