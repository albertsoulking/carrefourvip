import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ModalCreateProduct from './ModalCreate';
import getColumns from './columns';
import api from '../../routes/api';
import Overview from './OverView';
import usePageState from '../../hooks/usePageState';
import ActionBarExpand from './ActionBarExpand';
import ActionBarCollapse from './ActionBarCollapse';
import { enqueueSnackbar } from 'notistack';
import useNotificationSocket from '../../hooks/useNotificationSocket';
import web from '../../routes/web';

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

const ProductListPage = () => {
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
    const [categoriesData, setCategoriesData] = useState([]);

    const [openCreateModal, setOpenCreateModal] = useState(false);
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
        loadCategory();
    }, []);

    const loadCategory = async () => {
        const res = await api.category.get();
        setCategoriesData(res.data);
    };

    const loadData = async (payload) => {
        setLoading(true);
        setSearchModal(payload);
        setState(payload);

        try {
            const res = await api.product.getAll(payload);
            setFetchData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useNotificationSocket((noti) => {
        if (!noti) return;
        if (noti.type !== 'product') return;
        if (noti.path !== web.product.list) return;

        loadData(searchModal);
        setState(searchModal);
    });

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

                {/* Actions bar */}
                <motion.div variants={itemVariants}>
                    {isExpand ? (
                        <ActionBarExpand
                            onSearch={loadData}
                            searchModal={searchModal}
                            categoriesData={categoriesData}
                            setPaginationModel={setPaginationModel}
                            setIsExpand={setIsExpand}
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

                {/* Data grid */}
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
            {/** View Product */}

            {/** Create New Product */}
            <ModalCreateProduct
                open={openCreateModal}
                setOpen={setOpenCreateModal}
            />
        </Box>
    );
};

export default ProductListPage;
