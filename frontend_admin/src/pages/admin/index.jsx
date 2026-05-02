import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { DataGrid } from '@mui/x-data-grid';
import api from '../../routes/api';
import { useEffect, useState } from 'react';
import getColumns from './columns';
import Overview from './OverView';
import usePageState from '../../hooks/usePageState';
import ActionBarExpand from './ActionBarExpand';
import { enqueueSnackbar } from 'notistack';
import useNotificationSocket from '../../hooks/useNotificationSocket';
import web from '../../routes/web';

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

const AdminListPage = () => {
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
    const [adminsData, setAdminsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchModal, setSearchModal] = useState({
        page: 1,
        limit: 10,
        orderBy: 'desc',
        sortBy: 'id'
    });
    const [state, setState] = usePageState(searchModal);
    useEffect(() => {
        loadData(state ?? searchModal);
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        const res = await api.agent.getAdmins({ roleName: 'admin' });
        setAdminsData(res.data);
    };

    const loadData = async (payload) => {
        setLoading(true);
        setSearchModal(payload);
        setState(payload);

        try {
            const res = await api.agent.findAdmins(payload);
            setFetchData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useNotificationSocket((noti) => {
        if (!noti) return;
        if (noti.type !== 'admin') return;
        if (noti.path !== web.admin.list) return;

        loadData(searchModal);
        setState(searchModal);
    });

    const updateData = async (data) => {
        const payload = {
            id: data.id,
            name: data.name,
            email: data.email,
            status: data.status,
            referralCode: data.referralCode,
            parentId: data.parentId,
            remark: data.remark
        };

        try {
            await api.agent.updateAdmins(payload);
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

    const onChangeRole = async (payload) => {
        setLoading(true);

        try {
            await api.agent.changeRole(payload);
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
                {/* Statistics Cards */}
                <motion.div variants={itemVariants}>
                    <Overview data={fetchData.overview} />
                </motion.div>
                {/* Actions Bar */}
                <motion.div variants={itemVariants}>
                    <ActionBarExpand
                            onSearch={loadData}
                            searchModal={searchModal}
                            setPaginationModel={setPaginationModel}
                            adminsData={adminsData} />
                </motion.div>
                {/** Data Grid */}
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
                                console.error(err);
                                throw err;
                            }
                        }}
                        onProcessRowUpdateError={(error) => {
                            enqueueSnackbar(error, {
                                variant: 'error'
                            });
                        }}
                        rows={fetchData?.data}
                        columns={getColumns({
                            adminsData,
                            updateData,
                            onChangeRole
                        })}
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

export default AdminListPage;
