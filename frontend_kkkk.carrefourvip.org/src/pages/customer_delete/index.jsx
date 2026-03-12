import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../../routes/api';
import getColumns from './columns';
import usePageState from '../../hooks/usePageState';

const CustomerDeletePage = () => {
    const [loading, setLoading] = useState(true);
    const [sortModel, setSortModel] = useState([{ field: 'id', sort: 'asc' }]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10
    });
    const [fetchData, setFetchData] = useState({
        overview: null,
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
    const [state, setState] = usePageState(searchModal);

    useEffect(() => {
        loadData(state ?? searchModal);
    }, []);

    // Fetch users data
    const loadData = async (payload) => {
        setLoading(true);
        setSearchModal(payload);
        setState(payload);

        try {
            const res = await api.user.getDeleted(payload);
            setFetchData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
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
                rows={fetchData?.data}
                columns={getColumns()}
                getRowHeight={() => 'auto'}
                disableColumnFilter
                disableColumnMenu
                disableSelectionOnClick
                loading={loading}
                pageSize={searchModal.limit}
                pagination
                paginationMode={'server'}
                rowCount={fetchData?.total}
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
        </Box>
    );
};

export default CustomerDeletePage;
