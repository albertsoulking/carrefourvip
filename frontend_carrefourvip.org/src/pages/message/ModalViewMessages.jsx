import {
    Box,
    IconButton,
    Dialog,
    DialogContent,
    Typography
} from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import ChatMessages from './ChatMessages';
import { useEffect } from 'react';
import api from '../../routes/api';

const ModalViewMessages = ({ open, data, setOpen, loadData, searchModal }) => {
    useEffect(() => {
        markAsRead();
    }, [open]);

    const markAsRead = async () => {
        if (!data) return;

        await api.tickets.read({ id: data.id });
        loadData(searchModal);
    };

    return (
        <Dialog
            open={open}
            maxWidth={'sm'}
            fullWidth
            onClose={() => setOpen({ open: false, data: null })}
            scroll={'paper'}
            PaperProps={{
                sx: {
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '60vh'
                }
            }}>
            <Box
                px={2}
                py={0.5}
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>
                    Ticket ID: <span translate={'no'}>#{data?.id}</span>
                </Typography>
                <IconButton
                    color={'error'}
                    onClick={() => setOpen({ open: false, data: null })}>
                    <CloseRounded />
                </IconButton>
            </Box>
            <DialogContent
                dividers
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    bgcolor: '#f5f5f5'
                }}>
                {data &&
                    data?.messages.map((msg) => (
                        <ChatMessages
                            key={msg.id}
                            message={msg}
                        />
                    ))}
            </DialogContent>
        </Dialog>
    );
};

export default ModalViewMessages;
