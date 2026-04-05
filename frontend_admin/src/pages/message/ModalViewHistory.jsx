import { CloseRounded } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import ChatMessages from './ChatMessages';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';
import usePermissionStore from '../../hooks/usePermissionStore';

const ModalViewHistory = ({ open, data, setOpen }) => {
    const permissions = usePermissionStore((state) => state.permissions);
    const userInfo = JSON.parse(localStorage.getItem('user'));
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        setMessages(data?.messages);
    }, [data]);

    const handleOnSend = async () => {
        if (message === '') return;

        const payload = {
            ticketId: data?.id,
            message
        };

        const msg = {
            sender: { name: userInfo?.name },
            content: message,
            createdAt: new Date()
        };

        setMessages((prev) => [...prev, msg]);
        setMessage('');

        try {
            await api.message.send(payload);
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

    const updateData = async (data) => {
        const payload = {
            id: data.id,
            status: data.status
        };

        try {
            await api.ticket.update(payload);
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
        <Dialog
            open={open}
            maxWidth={'sm'}
            fullWidth
            scroll={'paper'}
            PaperProps={{
                sx: {
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh',
                    bgcolor: '#f1f1f1'
                }
            }}>
            <DialogTitle
                sx={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#fff',
                    zIndex: 10,
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 3, // 左右内边距
                    py: 2 // 上下内边距
                }}>
                <Box
                    display={'flex'}
                    alignItems={'center'}>
                    <Typography
                        variant={'body2'}
                        mr={1}>
                        工单ID：{data?.id} [{data?.user.name}]
                    </Typography>
                    {data?.status === 'opened' &&
                        permissions.includes('ticket.changeStatus') && (
                            <Button
                                variant={'outlined'}
                                color={'error'}
                                size={'small'}
                                onClick={() => {
                                    updateData({
                                        id: data?.id,
                                        status: 'closed'
                                    });
                                    setOpen(false);
                                }}>
                                结束此会话
                            </Button>
                        )}
                </Box>

                <Box>
                    <IconButton
                        color={'error'}
                        onClick={() => setOpen(false)}>
                        <CloseRounded />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent
                dividers
                sx={{
                    flex: 1,
                    overflowY: 'auto'
                }}>
                {messages &&
                    messages.map((msg, index) => (
                        <ChatMessages
                            key={index}
                            message={msg}
                            status={data?.status}
                            setMessages={setMessages}
                        />
                    ))}
            </DialogContent>
            <DialogActions
                sx={{
                    position: 'sticky',
                    bottom: 0,
                    backgroundColor: '#fff',
                    borderTop: '1px solid #eee',
                    zIndex: 10
                }}>
                {data?.status === 'closed' ? (
                    <Typography
                        textAlign={'center'}
                        fontWeight={'bold'}
                        color={'error'}
                        sx={{ width: '100%' }}>
                        该会话工单已结束
                    </Typography>
                ) : (
                    permissions.includes('message.send') && (
                        <>
                            <TextField
                                value={message}
                                size={'small'}
                                fullWidth
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.keyCode === 13)
                                        handleOnSend();
                                }}
                                disabled={data?.status === 'closed'}
                            />
                            <Button
                                variant='contained'
                                onClick={handleOnSend}
                                disabled={data?.status === 'closed'}>
                                发送
                            </Button>
                        </>
                    )
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ModalViewHistory;
