import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Overview from './OverView';
import api from '../../routes/api';
import getColumns from './columns';
import usePageState from '../../hooks/usePageState';
import ActionBarExpand from './ActionBarExpand';
import { enqueueSnackbar } from 'notistack';

// Animation variants
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

const EventListPage = () => {
    const { notifications } = useOutletContext();
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
    const [notis, setNotis] = useState([]);
    
    useEffect(() => {
        loadData(state ?? searchModal);
    }, []);

    useEffect(() => {
        const userNoti = notifications.filter((noti) => noti.type === 'user');
        if (userNoti.length === 0) return;

        setNotis(userNoti);
        loadData(state ?? searchModal);
    }, [notifications]);

    // Fetch users data
    const loadData = async (payload) => {
        setLoading(true);
        setSearchModal(payload);
        setState(payload);

        try {
            const res = await api.event.getAll(payload);
            setFetchData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateData = async (data) => {
        const payload = {
            id: data.id,
            name: data.name,
            phone: data.phone,
            email: data.email,
            balance: data.balance,
            status: data.status,
            parentId: data.parentId,
            remark: data.remark,
            mode: data.mode,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country
        };

        try {
            await api.user.update(payload);
            loadData(searchModal);
            setState(searchModal);
        } catch (error) {
            enqueueSnackbar(
                Array.isArray(error.response?.data?.message)
                    ? error.response.data.message[0]
                    : error.response?.data?.message || error.message,
                {
                    variant: 'error'
                }
            );
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
        <Box sx={{ p: 3 }}>
            <motion.div
                variants={containerVariants}
                initial={'hidden'}
                animate={'visible'}>
                {/* Statistics Cards */}
                <motion.div variants={itemVariants}>
                    <Overview
                        data={fetchData.overview}
                        onSearch={loadData}
                        setPaginationModel={setPaginationModel}
                    />
                </motion.div>

                {/* Actions Bar */}
                <motion.div variants={itemVariants}>
                    <ActionBarExpand
                            onSearch={loadData}
                            searchModal={searchModal}
                            setPaginationModel={setPaginationModel} />
                </motion.div>

                {/* Data Grid */}
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

                                await updateData(updatedRow);
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
                </motion.div>
            </motion.div>
        </Box>
    );
};

export default EventListPage;
