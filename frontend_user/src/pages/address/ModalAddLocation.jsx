import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    TextField,
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../routes/api';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';

const ModalAddLocation = ({ open, loadData, setOpen }) => {
    const fields = [
        {
            label: 'Receiver Name',
            value: ''
        },
        {
            label: 'Receiver Phone Number',
            value: ''
        },
        {
            label: 'Zip Code',
            value: ''
        },
        {
            label: 'Address/Street/House NO',
            value: ''
        },
        {
            label: 'City/Region',
            value: ''
        },
        {
            label: 'State/Province',
            value: ''
        },
        {
            label: 'Country',
            value: ''
        }
    ];

    const [formData, setFormData] = useState(fields);

    const handleOnChange = (event, index) => {
        setFormData((prev) => {
            const next = [...prev];
            next[index].value = event.target.value;
            return next;
        });
    };

    const handleOnAddClick = async () => {
        const payload = {
            receiverName: formData[0].value.trim(),
            receiverMobile: formData[1].value.trim(),
            postalCode: formData[2].value.trim(),
            address: formData[3].value.trim(),
            city: formData[4].value.trim(),
            state: formData[5].value.trim(),
            country: formData[6].value.trim()
        };

        try {
            await api.locations.createOne(payload);
            loadData();
            setOpen(false);
            setFormData(fields);
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
            fullWidth>
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 0
                }}>
                <span>Add Address</span>
                <IconButton
                    color={'error'}
                    onClick={() => setOpen(false)}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pb: 0 }}>
                <Box
                    component={'form'}
                    sx={{ pt: 2 }}>
                    {formData.map((item, index) => (
                        <TextField
                            key={index}
                            size={'small'}
                            label={item.label}
                            fullWidth
                            value={item.value}
                            InputProps={{
                                sx: {
                                    fontSize: 18
                                }
                            }}
                            sx={{ mb: 2 }}
                            onChange={(event) => handleOnChange(event, index)}
                        />
                    ))}
                </Box>
                <Button
                    variant={'contained'}
                    fullWidth
                    sx={{
                        mb: 2,
                        textTransform: 'capitalize'
                    }}
                    onClick={handleOnAddClick}>
                    Add
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default ModalAddLocation;
