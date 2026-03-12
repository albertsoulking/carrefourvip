import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import { AddRounded } from '@mui/icons-material';
import web from '../../routes/web';
import CardLocation from './CardLocation';
import ModalAddLocation from './ModalAddLocation';
import ModalUpdateLocation from './ModalUpdateLocation';
import ModalDeleteLocation from './ModalDeleteLocation';
import TopNavigator from '../layout/TopNavigator';

const AddressPage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState({
        open: false,
        data: null
    });
    const [openDeleteModal, setOpenDeleteModal] = useState({
        open: false,
        data: null
    });
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        if (!user) return;

        loadData();
    }, []);

    const loadData = async () => {
        const res = await api.locations.getMyLocations();
        setLocations(res.data);
    };

    return (
        <Box mt={8}>
            <TopNavigator
                backText={'Profile'}
                backPath={web.profile}
                title={'Delivery Addresses'}
                btn={
                    <Button
                        variant={'outlined'}
                        size={'small'}
                        startIcon={<AddRounded fontSize={'small'} />}
                        sx={{ p: 0, textTransform: 'capitalize', fontSize: 16 }}
                        onClick={() => setOpenAddModal(true)}>
                        Add
                    </Button>
                }
            />
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                sx={{ mt: 3, mx: 2, mb: 1 }}></Box>
            <Box pb={2}>
                {locations.map((location) => (
                    <CardLocation
                        key={location.id}
                        data={location}
                        setOpenEdit={setOpenUpdateModal}
                        setOpenDelete={setOpenDeleteModal}
                        loadData={loadData}
                    />
                ))}
            </Box>
            <ModalAddLocation
                open={openAddModal}
                setOpen={setOpenAddModal}
                loadData={loadData}
            />
            <ModalUpdateLocation
                open={openUpdateModal.open}
                data={openUpdateModal.data}
                setOpen={setOpenUpdateModal}
                loadData={loadData}
            />
            <ModalDeleteLocation
                open={openDeleteModal.open}
                data={openDeleteModal.data}
                setOpen={setOpenDeleteModal}
                loadData={loadData}
            />
        </Box>
    );
};

export default AddressPage;
