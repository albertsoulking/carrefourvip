import { useState } from 'react';
import api from '../../routes/api';
import {
    Box,
    TextField,
    Grid,
    Paper,
    IconButton,
    InputAdornment,
    Typography
} from '@mui/material';
import { Visibility, VisibilityOff, CloseRounded } from '@mui/icons-material';
import ButtonSubmit from './ButtonSubmit';

const ChangePassword = ({ setOpen }) => {
    const fields = [
        {
            label: 'Current Password',
            valueKey: 'currentPassword',
            showKey: 'showCurrentPassword'
        },
        {
            label: 'Password',
            valueKey: 'password',
            showKey: 'showPassword'
        },
        {
            label: 'Confirm Password',
            valueKey: 'confirmPassword',
            showKey: 'showConfirmPassword'
        }
    ];

    const [values, setValues] = useState({
        currentPassword: '',
        password: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showPassword: false,
        showConfirmPassword: false
    });

    const handleOnChange = (event, index) => {
        setValues({ ...values, [index]: event.target.value.trim() });
    };

    const handleClickShowPassword = (prop) => () => {
        setValues({ ...values, [prop]: !values[prop] });
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleOnChangePasswordClick = async (event) => {
        event.preventDefault();

        if (values.password !== values.confirmPassword) {
            enqueueSnackbar('Passwords do not match!', {
                variant: 'warning'
            });
            return;
        }

        const payload = {
            oldPassword: values.currentPassword,
            newPassword: values.password,
            userType: 'user'
        };

        try {
            await api.auth.changePassword(payload);

            enqueueSnackbar('Set new password successfully!', {
                variant: 'success'
            });
            setValues({
                currentPassword: '',
                password: '',
                confirmPassword: '',
                showCurrentPassword: false,
                showPassword: false,
                showConfirmPassword: false
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
                    Change Password
                </Typography>
                <IconButton onClick={() => setOpen(false)}>
                    <CloseRounded color={'error'} />
                </IconButton>
            </Box>
            <Box component='form'>
                <Grid
                    container
                    spacing={2}>
                    {fields.map((item, index) => (
                        <TextField
                            key={index}
                            label={item.label}
                            type={values[item.showKey] ? 'text' : 'password'}
                            fullWidth
                            size={'small'}
                            value={item.value}
                            InputProps={{
                                sx: {
                                    background: '#fff',
                                    fontSize: 16,
                                    pr: 2
                                },
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <IconButton
                                            onClick={handleClickShowPassword(
                                                item.showKey
                                            )}
                                            onMouseDown={
                                                handleMouseDownPassword
                                            }
                                            edge={'end'}>
                                            {values[item.showKey] ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            onChange={(event) =>
                                handleOnChange(event, item.valueKey)
                            }
                        />
                    ))}
                </Grid>
                <Box
                    display='flex'
                    justifyContent='flex-end'
                    sx={{ mt: 2 }}>
                    <ButtonSubmit onSubmit={handleOnChangePasswordClick} />
                </Box>
            </Box>
        </Paper>
    );
};

export default ChangePassword;
