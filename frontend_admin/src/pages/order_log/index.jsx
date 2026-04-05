import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { DataGrid } from '@mui/x-data-grid';
import { useOutletContext } from 'react-router-dom';
import api from '../../routes/api';
import { useEffect, useState } from 'react';
import getColumns from './columns';
import usePageState from '../../hooks/usePageState';
import ActionBarExpand from './ActionBarExpand';
import ActionBarCollapse from './ActionBarCollapse';
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

const OrderLogPage = () => {
    const { roleMenus } = useOutletContext();
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
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState([]);
    const [searchModal, setSearchModal] = useState({
        page: 1,
        limit: 10,
        orderBy: 'desc',
        sortBy: 'id',
        userType: 'user'
    });
    const [state, setState] = usePageState(searchModal);
    const [isExpand, setIsExpand] = useState(false);

    useEffect(() => {
        loadData(state ?? searchModal);
    }, []);

    useEffect(() => {
        setPermissions(findPermissionsByPath(roleMenus).map((p) => p.key));
    }, [roleMenus]);

    const loadData = async (payload) => {
        setLoading(true);
        setSearchModal(payload);
        setState(payload);

        try {
            const res = await api.log.getAll(payload);
            setFetchData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const findPermissionsByPath = (menus) => {
        for (const menu of menus) {
            if (menu.children?.length > 0) {
                const result = findPermissionsByPath(menu.children);
                if (result && result.length > 0) return result;
            }

            if (
                menu.path === location.pathname &&
                menu.permissions?.length > 0
            ) {
                return menu.permissions;
            }
        }
        return [];
    };

    return (
        <Box sx={{ p: 2 }}>
            <motion.div
                variants={containerVariants}
                initial={'hidden'}
                animate={'visible'}>
                {/* Actions Bar */}
                <motion.div variants={itemVariants}>
                    {isExpand ? (
                        <ActionBarExpand
                            searchModal={searchModal}
                            onSearch={loadData}
                            setPaginationModel={setPaginationModel}
                            setIsExpand={setIsExpand}
                        />
                    ) : (
                        <ActionBarCollapse
                            searchModal={searchModal}
                            onSearch={loadData}
                            setPaginationModel={setPaginationModel}
                            setIsExpand={setIsExpand}
                        />
                    )}
                </motion.div>
                {/** Data Grid */}
                <motion.div variants={itemVariants}>
                    <DataGrid
                        columnVisibilityModel={{
                            id: false
                        }}
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
                                return newRow;
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
                </motion.div>
            </motion.div>
        </Box>
    );
};

export default OrderLogPage;
