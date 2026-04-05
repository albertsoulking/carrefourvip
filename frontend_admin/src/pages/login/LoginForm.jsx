import { AdminPanelSettingsRounded, LoginRounded } from '@mui/icons-material';
import {
    Alert,
    alpha,
    Box,
    Button,
    CircularProgress,
    Container,
    Fade,
    Paper,
    Slide,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import logo from '../../assets/logo.png';
import { useState } from 'react';
import api from '../../routes/api';
import web from '../../routes/web';
import useSmartNavigate from '../../hooks/useSmartNavigate';

const LoginForm = ({
    setForm
}) => {
    const items = [
        { name: 'email', label: '账号', type: 'text' },
        { name: 'password', label: '密码', type: 'password' }
    ];

    const theme = useTheme();
    const navigate = useSmartNavigate();
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => {
            const updated = { ...prev };

            if (value === '') delete updated[name]; // 移除字段
            else updated[name] = value; // 设置新值

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.auth.login(formData);

            // check if has two factor
            if (res.data.admin.twoFactorEnabled === 1) {
                setForm({ page: 1, data: formData});
            } else {
                // Store token and user data in local storage
                localStorage.setItem('token', res.data.access_token);
                localStorage.setItem('user', JSON.stringify(res.data.admin));

                // Navigate to dashboard
                navigate(web.home);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    'Login failed. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fade
            in={true}
            timeout={800}>
            <Container
                maxWidth={'sm'}
                sx={{ width: '100%' }}>
                <Slide
                    direction={'up'}
                    in={true}
                    timeout={500}>
                    <Paper
                        elevation={6}
                        sx={{
                            p: { xs: 3, sm: 4, md: 6 },
                            width: '100%',
                            borderRadius: 3,
                            backgroundColor: alpha(
                                theme.palette.background.paper,
                                0.95
                            ),
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(
                                theme.palette.divider,
                                0.1
                            )}`,
                            boxShadow: theme.shadows[10]
                        }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                            {/* <Box
                                    component={'img'}
                                    src={logo}
                                    alt={'Logo'}
                                    sx={{
                                        height: 100,
                                        width: 'auto',
                                        mb: 2,
                                        borderRadius: 2,
                                        boxShadow: theme.shadows[2],
                                        border: `2px solid ${theme.palette.background.paper}`
                                    }}
                                /> */}
                            <AdminPanelSettingsRounded
                                color={'primary'}
                                sx={{ fontSize: 120, mb: 2 }}
                            />
                            <Typography
                                variant={'h4'}
                                component={'h1'}
                                align={'center'}
                                gutterBottom
                                sx={{
                                    fontWeight: 700,
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                超级管理员后台
                            </Typography>

                            {/* <Typography
                                    variant={'subtitle1'}
                                    align={'center'}
                                    color={'text.secondary'}
                                    sx={{
                                        maxWidth: '80%'
                                    }}>
                                    登录超级管理员后台
                                </Typography> */}
                        </Box>

                        {error && (
                            <Alert
                                severity={'error'}
                                sx={{
                                    width: '100%',
                                    borderRadius: 2,
                                    boxShadow: theme.shadows[1]
                                }}>
                                {error}
                            </Alert>
                        )}

                        <Box
                            component={'form'}
                            onSubmit={handleSubmit}
                            sx={{ width: '100%' }}>
                            {items.map((item, index) => (
                                <TextField
                                    {...item}
                                    key={index}
                                    variant={'outlined'}
                                    fullWidth
                                    margin={'normal'}
                                    value={formData[item.name] || ''}
                                    onChange={handleInputChange}
                                    required
                                    autoFocus
                                    InputProps={{
                                        sx: {
                                            borderRadius: 2,
                                            bgcolor: alpha(
                                                theme.palette.background.paper,
                                                0.5
                                            ),
                                            '&:hover': {
                                                bgcolor: alpha(
                                                    theme.palette.background
                                                        .paper,
                                                    0.7
                                                )
                                            }
                                        }
                                    }}
                                />
                            ))}
                            <Button
                                type={'submit'}
                                fullWidth
                                variant={'contained'}
                                color={'primary'}
                                size={'large'}
                                disabled={loading}
                                startIcon={
                                    !loading && (
                                        <LoginRounded fontSize={'inherit'} />
                                    )
                                }
                                sx={{
                                    mt: 3,
                                    py: 1.5,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    letterSpacing: 0.5,
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: theme.shadows[4]
                                    },
                                    transition: 'all 0.3s ease'
                                }}>
                                {loading ? (
                                    <CircularProgress
                                        size={24}
                                        color={'inherit'}
                                    />
                                ) : (
                                    '登录'
                                )}
                            </Button>

                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Typography
                                    variant={'body2'}
                                    color={'text.secondary'}
                                    sx={{
                                        fontSize: '0.85rem',
                                        opacity: 0.8
                                    }}>
                                    © {new Date().getFullYear()} CarreFour
                                    Admin. All rights reserved.
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Slide>
            </Container>
        </Fade>
    );
};

export default LoginForm;
