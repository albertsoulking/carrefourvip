import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Overview from './OverView';
import getColumns from './columns';
import { useOutletContext } from 'react-router-dom';
import api from '../../routes/api';
import usePageState from '../../hooks/usePageState';
import ActionBarCollapse from './ActionBarCollapse';
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
            duration: 0.5
        }
    }
};

const FinanceDepositPage = () => {
    const { roleMenus } = useOutletContext();
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
    const [permissions, setPermissions] = useState([]);
    const [searchModal, setSearchModal] = useState({
        page: 1,
        limit: 10,
        orderBy: 'desc',
        sortBy: 'id',
        type: 'deposit'
    });
    const [state, setState] = usePageState(searchModal);
    const [isExpand, setIsExpand] = useState(false);
    const [teamsData, setTeamsData] = useState([]);

    useEffect(() => {
        loadData(state ?? searchModal);
        fetchTeams();
    }, []);

    useEffect(() => {
        setPermissions(findPermissionsByPath(roleMenus).map((p) => p.key));
    }, [roleMenus]);

    const loadData = async (payload) => {
        setLoading(true);
        setSearchModal(payload);
        setState(payload);

        try {
            const res = await api.transactions.getAll(payload);
            setFetchData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeams = async () => {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (userInfo.role.name === 'team' || userInfo.role.name === 'head')
            return;

        const res = await api.agent.getAdmins({ roleName: 'team' });
        setTeamsData(res.data);
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
                {/* Stats cards */}
                <motion.div variants={itemVariants}>
                    <Overview data={fetchData.overview} />
                </motion.div>

                {/* Search and filter */}
                <motion.div variants={itemVariants}>
                    {isExpand ? (
                        <ActionBarExpand
                            onSearch={loadData}
                            searchModal={searchModal}
                            setPaginationModel={setPaginationModel}
                            setIsExpand={setIsExpand}
                            teamsData={teamsData}
                        />
                    ) : (
                        <ActionBarCollapse
                            onSearch={loadData}
                            searchModal={searchModal}
                            setPaginationModel={setPaginationModel}
                            setIsExpand={setIsExpand}
                        />
                    )}
                </motion.div>

                {/* Orders list */}
                <motion.div variants={itemVariants}>
                    <DataGrid
                        getRowId={(row) => row.id}
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

                                // upate data
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
                        columns={getColumns({ permissions })}
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

export default FinanceDepositPage;
