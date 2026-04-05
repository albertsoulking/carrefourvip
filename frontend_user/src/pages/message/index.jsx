import { Box, Button, Pagination } from '@mui/material';
import { SendRounded } from '@mui/icons-material';
import { useEffect } from 'react';
import api from '../../routes/api';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import MessageItem from './MessageItem';
import ModalViewMessages from './ModalViewMessages';
import ModalSendMessage from './ModalSendMessage';
import TopNavigator from '../layout/TopNavigator';
import web from '../../routes/web';

const MessagePage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [searchParams] = useSearchParams();
    const [openViewMessageModal, setOpenViewMessageModal] = useState({
        open: false,
        data: null
    });
    const [openSendMessageModal, setOpenSendMessageModal] = useState(false);
    const [fetchData, setFetchData] = useState({
        data: [],
        total: 0,
        page: 1,
        lastPage: 0
    });
    const [searchModal, setSearchModal] = useState({
        page: 1,
        limit: 6,
        orderBy: 'desc',
        sortBy: 'id'
    });

    useEffect(() => {
        loadData(searchModal);
    }, [searchParams]);

    const loadData = async (payload) => {
        if (!user) return;

        setSearchModal(payload);

        const res = await api.tickets.getAll(payload);
        setFetchData(res.data);
    };

    return (
        <Box sx={{ mt: 8 }}>
            <TopNavigator
                backText={'Profile'}
                backPath={web.profile}
                title={'Messages'}
                btn={
                    <Button
                        size={'small'}
                        startIcon={<SendRounded fontSize={'small'} />}
                        sx={{ p: 0, textTransform: 'capitalize' }}
                        onClick={() => setOpenSendMessageModal(true)}>
                        Send
                    </Button>
                }
            />
            <Box>
                {fetchData.data.map((item) => (
                    <MessageItem
                        key={item.id}
                        data={item}
                        setOpen={() =>
                            setOpenViewMessageModal({ open: true, data: item })
                        }
                    />
                ))}
            </Box>
            <Box
                my={2}
                display={'flex'}
                justifyContent={'center'}
                translate={'no'}>
                <Pagination
                    count={fetchData.lastPage}
                    page={fetchData.page}
                    onChange={(e, newPage) => {
                        loadData({
                            ...searchModal,
                            page: newPage
                        });
                    }}
                />
            </Box>
            <ModalViewMessages
                open={openViewMessageModal.open}
                data={openViewMessageModal.data}
                setOpen={setOpenViewMessageModal}
                loadData={loadData}
                searchModal={searchModal}
            />
            <ModalSendMessage
                open={openSendMessageModal}
                setOpen={setOpenSendMessageModal}
                loadData={loadData}
                searchModal={searchModal}
            />
        </Box>
    );
};

export default MessagePage;
