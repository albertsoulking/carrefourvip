import { useState } from 'react';
import api from '../../routes/api';
import {
    Box,
    TextField,
    Grid,
    Paper,
    IconButton,
    Typography
} from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import ButtonSubmit from './ButtonSubmit';
import { enqueueSnackbar } from 'notistack';

const EditProfile = ({ setOpen }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    const fields = [
        {
            label: 'Name',
            value: user?.name ?? ''
        },
        {
            label: 'E-mail Address',
            value: user?.email ?? '',
            disabled: true
        },
        {
            label: 'Mobile Number',
            value: user?.phone ?? ''
        }
    ];

    const [formData, setFormData] = useState(fields);

    const handleOnUpdateProfileClick = async () => {
        const payload = {
            id: user.id,
            name: formData[0].value.trim(),
            phone: formData[2].value.trim()
        };

        try {
            const res = await api.users.updateOne(payload);
            localStorage.setItem(
                'user',
                JSON.stringify({
                    ...user,
                    name: res.data.name,
                    phone: res.data.phone
                })
            );
            enqueueSnackbar('User updated successfully!', {
                variant: 'success'
            });
            setOpen(false);
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

    const handleOnChange = (event, index) => {
        setFormData((prev) => {
            const next = [...prev];
            next[index].value = event.target.value;
            return next;
        });
    };

    return (
        <Paper
            elevation={0}
            sx={{
                background: '#fff',
                borderRadius: 3,
                m: 1
            }}>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                justifyItems={'center'}>
                <IconButton disabled>
                    <CloseRounded sx={{ color: '#fff' }} />
                </IconButton>
                <Typography
                    fontSize={18}
                    fontWeight={'bold'}
                    sx={{ lineHeight: 2.5 }}>
                    Edit Profile
                </Typography>
                <IconButton onClick={() => setOpen(false)}>
                    <CloseRounded color={'error'} />
                </IconButton>
            </Box>
            <Box
                component={'form'}
                mt={2}>
                <Grid
                    container
                    spacing={2}>
                    {formData.map((item, index) => (
                        <TextField
                            key={index}
                            label={item.label}
                            fullWidth
                            size={'small'}
                            disabled={item.disabled}
                            value={item.value}
                            type={item.type || 'text'}
                            InputProps={{
                                sx: {
                                    fontSize: 18
                                }
                            }}
                            onChange={(event) => handleOnChange(event, index)}
                        />
                    ))}
                </Grid>
                <Box
                    display={'flex'}
                    justifyContent={'flex-end'}
                    sx={{ mt: 2 }}>
                    <ButtonSubmit onSubmit={handleOnUpdateProfileClick} />
                </Box>
            </Box>
        </Paper>
    );
};

export default EditProfile;
