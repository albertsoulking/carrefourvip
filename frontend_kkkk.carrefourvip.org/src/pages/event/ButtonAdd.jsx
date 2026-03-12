import { AddRounded } from '@mui/icons-material';
import { Button } from '@mui/material';
import ModalCreate from './ModalCreate';
import { useEffect, useState } from 'react';
import api from '../../routes/api';

export default function ButtonAdd() {
    const [openCreate, setOpenCreate] = useState(false);
    const [luckyWheelData, setLuckyWheelData] = useState([]);

    useEffect(() => {
        loadLuckyWheel();
    }, []);

    const loadLuckyWheel = async () => {
        const res = await api.luckyWheel.findAll();
        setLuckyWheelData(res.data);
    };

    return (
        <>
            <Button
                variant={'contained'}
                startIcon={<AddRounded fontSize={'inherit'} />}
                onClick={() => setOpen(true)}
                sx={{ ml: 'auto', fontSize: 12 }}
                size={'small'}>
                添加活动
            </Button>
            <ModalCreate
                open={openCreate}
                setOpen={setOpenCreate}
                luckyWheelData={luckyWheelData}
            />
        </>
    );
}
