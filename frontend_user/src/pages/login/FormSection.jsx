import { useState } from 'react';
import {
    Button,
    Grid,
    Typography,
    TextField,
    FormControl,
    OutlinedInput,
    InputAdornment,
    IconButton,
    FormControlLabel,
    Checkbox,
    FormHelperText,
    CircularProgress
} from '@mui/material';
import assets from '../../assets';
import web from '../../routes/web';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '../../routes/api';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { enqueueSnackbar } from 'notistack';

const FormSection = () => {
    const navigate = useSmartNavigate();
    const [loading, setLoading] = useState(false);
    const [account, setAccount] = useState('');
    const [accountError, setAccountError] = useState(false);
    const [accountErrorText, setAccountErrorText] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorText, setPasswordErrorText] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleOnAccountChange = (event) => {
        const { value } = event.target;

        setAccount(value);
        setAccountError(false);
        setAccountErrorText('');
    };

    const handleOnPasswordChange = (event) => {
        const { value } = event.target;

        setPassword(value);
        setPasswordError(false);
        setPasswordErrorText('');
    };

    const handleOnSignInClick = async () => {
        setLoading(true);

        const payload = {
            email: account.trim().toLocaleLowerCase(),
            password: password.trim()
        };

        try {
            const res = await api.auth.login(payload);

            localStorage.setItem('token', res.data.access_token);
            // localStorage.setItem('is_auth', JSON.stringify(true));
            localStorage.setItem('user', JSON.stringify(res.data.user));

            setTimeout(() => {
                setLoading(false);
                navigate(web.home);
            }, 500);
        } catch (error) {
            setLoading(false);
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

    const handleOnKeyDown = (event) => {
        if (event.key === 'Enter' && event.keyCode === 13)
            handleOnSignInClick(event);
    };

    return (
        <Grid
            container
            direction={'column'}
            sx={{
                px: 2,
                pt: 4,
                width: { xs: '100%', sm: 420 },
                float: 'inline-end'
            }}>
            <Grid>
                <Button
                    sx={{ p: 0, ':hover': { bgcolor: 'transparent' } }}
                    fullWidth
                    disableRipple
                    onClick={() => navigate(web.home)}>
                    <img
                        src={assets.kalefu}
                        alt='logo'
                        style={{ objectFit: 'cover', width: 140 }}
                    />
                </Button>
            </Grid>
            <Grid>
                <Typography
                    variant={'h5'}
                    fontWeight={'bold'}
                    sx={{ mt: 4, mb: 1 }}>
                    Sign In
                </Typography>
            </Grid>
            <Grid>
                <Typography
                    fontWeight={'bold'}
                    fontSize={14}
                    sx={{ mb: 0.5 }}>
                    Email
                </Typography>
                <TextField
                    error={accountError}
                    variant={'outlined'}
                    value={account}
                    placeholder={'Email'}
                    helperText={accountErrorText}
                    fullWidth
                    sx={{
                        mb: 2
                    }}
                    size={'small'}
                    focused={false}
                    onChange={handleOnAccountChange}
                    onKeyDown={handleOnKeyDown}
                    autoComplete={'off'}
                />
            </Grid>
            <Grid>
                <Typography
                    fontWeight={'bold'}
                    fontSize={14}
                    sx={{ mb: 0.5 }}>
                    Password
                </Typography>
                <FormControl
                    fullWidth
                    sx={{ mb: 1 }}
                    variant={'outlined'}
                    focused={false}>
                    <OutlinedInput
                        error={passwordError}
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        endAdornment={
                            <InputAdornment position={'end'}>
                                <IconButton
                                    aria-label={
                                        showPassword
                                            ? 'hide the password'
                                            : 'display the password'
                                    }
                                    onClick={handleClickShowPassword}
                                    edge={'end'}
                                    disableRipple>
                                    {showPassword ? (
                                        <VisibilityOff />
                                    ) : (
                                        <Visibility />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        }
                        value={password}
                        sx={{
                            '.MuiOutlinedInput-notchedOutline .css-14lo706>span':
                                { display: 'none' }
                        }}
                        size={'small'}
                        placeholder={'Password'}
                        onChange={handleOnPasswordChange}
                        onKeyDown={handleOnKeyDown}
                        autoComplete={'off'}
                    />
                    <FormHelperText error={passwordError}>
                        {passwordErrorText}
                    </FormHelperText>
                </FormControl>
            </Grid>
            <Grid>
                <Grid
                    container
                    justifyContent={'space-between'}
                    sx={{ mb: 1 }}>
                    <FormControlLabel
                        control={<Checkbox sx={{ borderRadius: 1 }} />}
                        sx={{ '.MuiFormControlLabel-label': { fontSize: 14 } }}
                        label={'Remember Me'}
                    />
                    <Button
                        sx={{
                            fontSize: 14,
                            textTransform: 'capitalize',
                            ':hover': { bgcolor: 'transparent' }
                        }}
                        onClick={() => navigate(web.password)}
                        disableRipple>
                        Forget Password?
                    </Button>
                </Grid>
            </Grid>
            <Grid>
                <Button
                    variant={'contained'}
                    color={'primary'}
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
                    onMouseDown={handleOnSignInClick}
                    startIcon={
                        <CircularProgress
                            size={20}
                            sx={{
                                display: loading ? 'inline' : 'none',
                                color: '#fff'
                            }}
                        />
                    }>
                    <span style={{ display: loading ? 'inline' : 'none' }}>
                        Logging in...
                    </span>
                    <span style={{ display: loading ? 'none' : 'inline' }}>
                        Sign In
                    </span>
                </Button>
            </Grid>
            <Grid>
                <Grid
                    container
                    justifyContent={'center'}
                    alignItems={'center'}
                    flexWrap={{ md: 'wrap', lg: 'nowrap' }}>
                    <Typography fontSize={16}>
                        Don't have any account?
                    </Typography>
                    <Button
                        sx={{
                            fontSize: 16,
                            textTransform: 'capitalize',
                            ':hover': { bgcolor: 'transparent' }
                        }}
                        onClick={() => navigate(web.register)}
                        disableRipple>
                        Create Account
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default FormSection;
