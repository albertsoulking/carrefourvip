import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../../routes/api';
import usePageState from '../../hooks/usePageState';
import ActionBarExpand from './ActionBarExpand';
import ActionBarCollapse from './ActionBarCollapse';
import getColumns from './columns';

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

const FlightBookingListPage = () => {
    const [sortModel, setSortModel] = useState([
        { field: 'createdAt', sort: 'desc' }
    ]);
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
    const [searchModal, setSearchModal] = useState({
        page: 1,
        limit: 10,
        orderBy: 'desc',
        sortBy: 'createdAt'
    });
    const [state, setState] = usePageState(searchModal);
    const [isExpand, setIsExpand] = useState(false);

    useEffect(() => {
        loadData(state ?? searchModal);
    }, []);

    const loadData = async (payload) => {
        setLoading(true);
        setSearchModal(payload);
        setState(payload);

        try {
            const res = await api.flightBooking.getAll(payload);
            setFetchData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'>
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

                <motion.div variants={itemVariants}>
                    <DataGrid
                        sortingOrder={['asc', 'desc']}
                        sortingMode='server'
                        filterMode='server'
                        sortModel={sortModel}
                        onSortModelChange={(model) => {
                            setSortModel(model);

                            if (!model[0]) return;

                            loadData({
                                ...searchModal,
                                orderBy: model[0].sort,
                                sortBy: model[0].field
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
                        paginationMode='server'
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

export default FlightBookingListPage;
