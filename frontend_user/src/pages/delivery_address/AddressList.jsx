import { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { AddRounded, CloseRounded } from '@mui/icons-material';
import CardLocation from './CardLocation';
import { useEffect } from 'react';
import api from '../../routes/api';
import ModalAddLocation from '../address/ModalAddLocation';
import ModalUpdateLocation from '../address/ModalUpdateLocation';
import ModalDeleteLocation from '../address/ModalDeleteLocation';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const AddressList = ({ setOpen, setSelectAddress, setSelectedAddress }) => {
    const { t } = useTranslation();
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
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await api.locations.getMyLocations();
            setLocations(res.data);
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

    return (
        <Box sx={{ pb: 1 }}>
            <Box
                display={'flex'}
                flexDirection={'row'}
                alignItems={'center'}
                justifyContent={'space-between'}
                my={2}>
                <IconButton
                    color={'error'}
                    onClick={() => setOpen(false)}>
                    <CloseRounded />
                </IconButton>
                <Typography>{t('deliveryAddress.myAddresses')}</Typography>
                <IconButton
                    color={'primary'}
                    onClick={() => setOpenAddModal(true)}>
                    <AddRounded />
                </IconButton>
            </Box>
            {locations.length > 0 &&
                locations.map((loc) => (
                    <CardLocation
                        key={loc.id}
                        data={loc}
                        loadData={loadData}
                        setOpen={setOpenUpdateModal}
                        setOpenDrawer={setOpen}
                        setSelectAddress={setSelectAddress}
                        setOpenEdit={setOpenUpdateModal}
                        setOpenDelete={setOpenDeleteModal}
                    />
                ))}
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
                setSelectedAddress={setSelectedAddress}
            />
        </Box>
    );
};

export default AddressList;
