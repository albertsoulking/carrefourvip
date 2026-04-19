import { useEffect, useState } from 'react';
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
    CircularProgress,
    MenuItem
} from '@mui/material';
import assets from '../../assets';
import web from '../../routes/web';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import api from '../../routes/api';
import countries from './countries';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { enqueueSnackbar } from 'notistack';

const FormSection = ({ setForm }) => {
    const navigate = useSmartNavigate();
    const [loading, setLoading] = useState(false);
    const [account, setAccount] = useState('');
    const [accountError, setAccountError] = useState(false);
    const [accountErrorText, setAccountErrorText] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailErrorText, setEmailErrorText] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorText, setPasswordErrorText] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [country, setCountry] = useState(null);
    const [mobile, setMobile] = useState('');
    const [accessTerm, setAccessTerm] = useState(false);
    const [ipConfig, setIpConfig] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const res = await api.ip.get();

        setCountry(res.data?.country_code);
        setIpConfig(res.data);
    };

    const handleOnAccountChange = (event) => {
        const { value } = event.target;

        setAccount(value);
        setAccountError(false);
        setAccountErrorText('');
    };

    const handleOnEmailChange = (event) => {
        const { value } = event.target;

        setEmail(value);
        setEmailError(false);
        setEmailErrorText('');
    };

    const handleOnCountryChange = (event) => {
        const { value } = event.target;

        setCountry(value);
    };

    const handleOnMobileChange = (event) => {
        const { value } = event.target;

        setMobile(isNaN(value) ? '' : value);
    };

    const handleOnPasswordChange = (event) => {
        const { value } = event.target;

        setPassword(value);
        setPasswordError(false);
        setPasswordErrorText('');
    };

    const handleOnAccessTermClick = (event) => {
        const { checked } = event.target;

        setAccessTerm(checked);
    };

    const handleOnSignInClick = async () => {
        // enqueueSnackbar(
        //     'Hello, your area does not support delivery service and you cannot register at the moment!',
        //     {
        //         variant: 'warning'
        //     }
        // );
        // return;

        if (!accessTerm) {
            enqueueSnackbar('Please check that I agree to the terms!', {
                variant: 'warning'
            });
            return;
        }

        setLoading(true);

        const payload = {
            name: account.trim().toLocaleLowerCase(),
            username: email.trim().toLocaleLowerCase(),
            email: email.trim().toLocaleLowerCase(),
            password: password.trim(),
            phone: `${ipConfig?.country_calling_code ?? '+1'}${mobile}`.replace(
                /\s+/g,
                ''
            ),
            referralCode: localStorage.getItem('code'),
            mode: 'live'
        };

        try {
            // await api.twoFactor.sendEmail({ email: payload.email });
            // setForm({ page: 1, data: payload });

            await api.auth.register(payload);

            enqueueSnackbar('Account registration successful!', {
                variant: 'success'
            });
            setTimeout(() => {
                setLoading(false);
                handleOnAutoLogin();
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

    const handleOnAutoLogin = async () => {
        const payload = {
            email: email.trim().toLocaleLowerCase(),
            password: password.trim()
        };

        try {
            const res = await api.auth.login(payload);

            localStorage.setItem('token', res.data.access_token);
            // localStorage.setItem('is_auth', JSON.stringify(true));
            localStorage.setItem('user', JSON.stringify(res.data.user));

            navigate(web.home);
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
                    Sign Up
                </Typography>
            </Grid>
            <Grid>
                <Typography
                    fontWeight={'bold'}
                    fontSize={14}
                    sx={{ mb: 0.5 }}>
                    User Name
                </Typography>
                <TextField
                    error={accountError}
                    variant={'outlined'}
                    value={account}
                    placeholder={'Usename'}
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
                    E-Mail Address
                </Typography>
                <TextField
                    error={emailError}
                    variant={'outlined'}
                    value={email}
                    placeholder={'Email'}
                    helperText={emailErrorText}
                    fullWidth
                    sx={{
                        mb: 2
                    }}
                    size={'small'}
                    focused={false}
                    onChange={handleOnEmailChange}
                    onKeyDown={handleOnKeyDown}
                    autoComplete={'off'}
                />
            </Grid>
            <Grid
                container
                flexWrap={'nowrap'}>
                <Grid sx={{ mr: 2 }}>
                    <Typography
                        fontWeight={'bold'}
                        fontSize={14}
                        sx={{ mb: 0.5 }}>
                        Country
                    </Typography>
                    <TextField
                        select
                        variant={'outlined'}
                        value={country ?? 'US'}
                        sx={{
                            mb: 2,
                            width: 120
                        }}
                        size={'small'}
                        focused={false}
                        onChange={handleOnCountryChange}
                        onKeyDown={handleOnKeyDown}>
                        {countries.map((item, index) => (
                            <MenuItem
                                key={index}
                                value={item.code}
                                sx={{ py: 0.5, minHeight: 30 }}>
                                {item.value}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid sx={{ ml: 2 }}>
                    <Typography
                        fontWeight={'bold'}
                        fontSize={14}
                        sx={{ mb: 0.5 }}>
                        Mobile Number
                    </Typography>
                    <TextField
                        variant={'outlined'}
                        value={mobile}
                        placeholder={'Mobile Number'}
                        fullWidth
                        sx={{
                            mb: 2
                        }}
                        size={'small'}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment
                                    sx={{ fontWeight: 'bold', pr: 2 }}>
                                    {country
                                        ? `+${
                                              countries.filter(
                                                  (item) =>
                                                      item.code === country
                                              )[0].mobile_code
                                          }`
                                        : '+1'}
                                </InputAdornment>
                            )
                        }}
                        focused={false}
                        onChange={handleOnMobileChange}
                        onKeyDown={handleOnKeyDown}
                        autoComplete={'off'}
                    />
                </Grid>
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
                    sx={{ mb: 2 }}
                    variant={'outlined'}
                    focused={false}>
                    <OutlinedInput
                        error={passwordError}
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        size={'small'}
                        endAdornment={
                            <InputAdornment position={'end'}>
                                <IconButton
                                    aria-label={
                                        showPassword
                                            ? 'hide the password'
                                            : 'display the password'
                                    }
                                    onClick={() =>
                                        setShowPassword((show) => !show)
                                    }
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
                    sx={{ mb: 1 }}>
                    <FormControlLabel
                        value={accessTerm}
                        control={<Checkbox sx={{ borderRadius: 1 }} />}
                        sx={{ '.MuiFormControlLabel-label': { fontSize: 12 } }}
                        label={
                            <Grid
                                container
                                alignItems={'center'}>
                                <Typography
                                    fontSize={12}
                                    onClick={() => console.log('gg')}>
                                    I agree with&nbsp;
                                </Typography>
                                <Typography
                                    fontSize={12}
                                    color={'primary'}
                                    sx={{
                                        ':hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                    onClick={() => navigate(web.privacy)}>
                                    Privacy Policy
                                </Typography>
                                ,&nbsp;
                                <Typography
                                    fontSize={12}
                                    color={'primary'}
                                    sx={{
                                        ':hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                    onClick={() => navigate(web.service)}>
                                    Terms of Service
                                </Typography>
                                ,&nbsp;
                                <Typography
                                    fontSize={12}
                                    color={'primary'}
                                    sx={{
                                        ':hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                    onClick={() => navigate(web.cookie)}>
                                    Cookie Policy
                                </Typography>
                                .
                            </Grid>
                        }
                        onClick={handleOnAccessTermClick}
                    />
                </Grid>
            </Grid>
            <Grid>
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
                    onClick={handleOnSignInClick}
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
                        Redirecting...
                    </span>
                    <span style={{ display: loading ? 'none' : 'inline' }}>
                        Sign Up
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
                        Already have an account?
                    </Typography>
                    <Button
                        sx={{
                            fontSize: 16,
                            textTransform: 'capitalize',
                            ':hover': { bgcolor: 'transparent' }
                        }}
                        onClick={() => navigate(web.login)}
                        disableRipple>
                        Login Now
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default FormSection;
