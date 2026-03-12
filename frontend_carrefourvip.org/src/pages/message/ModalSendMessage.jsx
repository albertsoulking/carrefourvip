import {
    Box,
    Button,
    Dialog,
    Grid,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import { useState } from 'react';
import api from '../../routes/api';
import { CloseRounded } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';

const ModalSendMessage = ({ open, setOpen, loadData, searchModal }) => {
    const items = [
        {
            name: 'subject',
            label: 'Subject',
            placeholder: 'Subject'
        },
        {
            name: 'message',
            label: 'Message',
            placeholder: 'Write Your Message',
            multiline: true,
            rows: 4
        }
    ];
    const [formData, setFormData] = useState({});

    const handleOnChange = (event) => {
        const { value, name } = event.target;

        setFormData({
            ...formData,
            [name]: value ?? ''
        });
    };

    const handleOnClick = async () => {
        if (Object.keys(formData).length === 0) {
            enqueueSnackbar('Please fill in the text box!', {
                variant: 'info'
            });
            return;
        }

        if (!formData.subject || formData.subject === '') {
            enqueueSnackbar('Subject can not be empty!', {
                variant: 'info'
            });
            return;
        }

        if (!formData.message || formData.message === '') {
            enqueueSnackbar('Message can not be empty!', {
                variant: 'info'
            });
            return;
        }

        const payload = {
            subject: formData.subject.trim(),
            message: formData.message.trim()
        };

        try {
            await api.tickets.createOne(payload);

            setFormData({});
            setOpen(false);
            loadData(searchModal);
            enqueueSnackbar(
                'We have received your message and our customer service will contact you within 24 hours.',
                {
                    variant: 'success'
                }
            );
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

    const onClose = () => {
        setFormData({});
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={'sm'}
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    padding: 3
                }
            }}>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                mb={2}>
                <Typography variant={'h6'}>Get In Touch With Us</Typography>
                <IconButton
                    color={'error'}
                    onClick={() => setOpen(false)}>
                    <CloseRounded />
                </IconButton>
            </Box>
            {items.map((item, index) => (
                <Grid key={index}>
                    <Typography
                        fontWeight={'bold'}
                        fontSize={14}
                        sx={{ mb: 1 }}>
                        {item.label}
                    </Typography>
                    <TextField
                        name={item.name}
                        variant={'outlined'}
                        value={formData[item.name] || ''}
                        placeholder={item.placeholder}
                        fullWidth
                        size={'small'}
                        sx={{
                            mb: 2,
                            '.MuiOutlinedInput-root': {
                                borderRadius: '10px'
                            }
                        }}
                        multiline={item.multiline}
                        rows={item.rows}
                        onChange={handleOnChange}
                    />
                </Grid>
            ))}
            <Button
                variant={'contained'}
                sx={{
                    py: 1,
                    px: 3,
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: '#fff',
                    transition: '0.6s',
                    boxShadow: 'none',
                    textTransform: 'capitalize'
                }}
                fullWidth
                onClick={handleOnClick}>
                Send Message
            </Button>
        </Dialog>
    );
};

export default ModalSendMessage;
