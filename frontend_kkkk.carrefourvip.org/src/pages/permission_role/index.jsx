import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import { motion } from 'framer-motion';
import { DataGrid } from '@mui/x-data-grid';
import getColumns from './columns';
import usePageState from '../../hooks/usePageState';
import { enqueueSnackbar } from 'notistack';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15
        }
    }
};

const PermissionRolePage = () => {
    const [loading, setLoading] = useState(true);
    const [sortModel, setSortModel] = useState([{ field: 'id', sort: 'asc' }]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10
    });
    const [searchModal, setSearchModal] = useState({
        page: 1,
        limit: 10,
        orderBy: 'asc',
        sortBy: 'id'
    });
    const [fetchData, setFetchData] = useState({
        data: [],
        total: 0,
        page: 1,
        lastPage: 0
    });
    const [state, setState] = usePageState(searchModal);

    // 获取所有角色
    useEffect(() => {
        loadData(state ?? searchModal);
    }, []);

    const loadData = async (payload) => {
        setLoading(true);
        setSearchModal(payload);
        setState(payload);

        try {
            const res = await api.roleMenu.getRoles(payload);
            setFetchData(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <motion.div
                variants={containerVariants}
                initial={'hidden'}
                animate={'visible'}>
                <motion.div variants={itemVariants}>
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
                        pageSize={Number(10)}
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
                </motion.div>
            </motion.div>
        </Box>
    );
};

export default PermissionRolePage;
