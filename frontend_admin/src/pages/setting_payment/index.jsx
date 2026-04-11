import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useOutletContext } from 'react-router-dom';
import getColumns from './columns';
import api from '../../routes/api';
import ModalCreatePayment from './ModalCreatePayment';
import usePageState from '../../hooks/usePageState';
import ModalDeleteCategory from './ModalDeleteCategory';
import ActionBarExpand from './ActionBarExpand';
import ActionBarCollapse from './ActionBarCollapse';
import ModalDetailPayment from './ModalDetailPayment';
import { enqueueSnackbar } from 'notistack';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
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
            stiffness: 300,
            damping: 24
        }
    }
};

const PaymentListPage = () => {
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
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState({
        open: false,
        data: null
    });
    const [openUpdateModal, setOpenUpdateModal] = useState({
        open: false,
        data: null
    });
    const [openDetailModal, setOpenDetailModal] = useState({
        open: false,
        data: null
    });
    const [permissions, setPermissions] = useState([]);
    const [searchModal, setSearchModal] = useState({
        page: 1,
        limit: 10,
        orderBy: 'desc',
        sortBy: 'id'
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
            const res = await api.gateway.getAll(payload);
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
            status: data.status,
            sortOrder: Number(data.sortOrder),
            discount: data.discount,
            visible: data.visible,
            isManual: data.isManual
        };

        try {
            await api.gateway.update(payload);
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
                {/* Actions bar */}
                {/* <motion.div variants={itemVariants}>
                    {isExpand ? (
                        <ActionBarExpand
                            setOpen={setOpenCreateModal}
                            permissions={permissions}
                            searchModal={searchModal}
                            onSearch={loadData}
                            setPaginationModel={setPaginationModel}
                            setIsExpand={setIsExpand}
                        />
                    ) : (
                        <ActionBarCollapse
                            setOpen={setOpenCreateModal}
                            permissions={permissions}
                            searchModal={searchModal}
                            onSearch={loadData}
                            setPaginationModel={setPaginationModel}
                            setIsExpand={setIsExpand}
                        />
                    )}
                </motion.div> */}

                {/* Data grid */}
                <motion.div variants={itemVariants}>
                    <DataGrid
                        columnVisibilityModel={
                            {
                                // id: false
                            }
                        }
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
                        columns={getColumns({
                            updateData,
                            permissions,
                            setOpenDeleteModal,
                            setOpenUpdateModal,
                            setOpenDetailModal
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
            {/** Create Category */}
            <ModalCreatePayment
                open={openCreateModal}
                setOpen={setOpenCreateModal}
                loadData={loadData}
                searchModal={searchModal}
            />
            {/** Delete Category */}
            <ModalDeleteCategory
                open={openDeleteModal.open}
                data={openDeleteModal.data}
                setOpen={setOpenDeleteModal}
                loadData={loadData}
                searchModal={searchModal}
            />
            <ModalDetailPayment
                open={openDetailModal.open}
                data={openDetailModal.data}
                setOpen={setOpenDetailModal}
                loadData={loadData}
                searchModal={searchModal}
            />
        </Box>
    );
};

export default PaymentListPage;
