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
import { useRef, useState } from 'react';
import api from '../../routes/api';
import web from '../../routes/web';
import useSmartNavigate from '../../hooks/useSmartNavigate';
import { enqueueSnackbar } from 'notistack';

const TwoFactorForm = ({ data, setForm }) => {
    const [token, setToken] = useState(['', '', '', '', '', '']);
    const inputsRef = useRef([]);

    const theme = useTheme();
    const navigate = useSmartNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handle2FAChange = (e, index) => {
        const val = e.target.value.replace(/\D/g, '');
        if (!val) return;

        const newToken = [...token];
        newToken[index] = val[0];
        setToken(newToken);

        // 自动聚焦下一个输入框
        if (index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handle2FAKeyDown = (e, index) => {
        const key = e.key;

        if (key === 'Backspace') {
            e.preventDefault();
            const newToken = [...token];
            newToken[index] = '';
            setToken(newToken);

            if (index > 0) {
                inputsRef.current[index - 1]?.focus();
            }
        } else if (key === 'ArrowLeft' && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (key === 'ArrowRight' && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (token.some((t) => t === '')) {
                enqueueSnackbar('请输入完整6位验证码!', {
                    variant: 'error'
                });
                return;
            }

            const payload = {
                ...data,
                token: token.join('')
            };

            const res = await api.auth.login(payload);
            if (res.data.access_token) {
                // Store token and user data in local storage
                localStorage.setItem('token', res.data.access_token);
                localStorage.setItem('user', JSON.stringify(res.data.admin));

                // Navigate to dashboard
                navigate(web.home);
            } else {
                setError('验证码无效！');
            }
        } catch (error) {
            setError(
                err.response?.data?.message ||
                    '2FA failed. Please check your 6-digits code.'
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
                                输入6位数的验证码
                            </Typography>
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
                            display={'flex'}
                            justifyContent={'center'}
                            alignItems={'center'}
                            gap={1}
                            my={2}>
                            {token.map((t, i) => (
                                <TextField
                                    key={i}
                                    value={t}
                                    inputRef={(el) =>
                                        (inputsRef.current[i] = el)
                                    }
                                    onChange={(e) => handle2FAChange(e, i)}
                                    onKeyDown={(e) => handle2FAKeyDown(e, i)}
                                    inputProps={{
                                        maxLength: 1,
                                        style: {
                                            textAlign: 'center',
                                            width: '20px'
                                        }
                                    }}
                                />
                            ))}
                        </Box>
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
                            }}
                            onClick={handleSubmit}>
                            {loading ? (
                                <CircularProgress
                                    size={24}
                                    color={'inherit'}
                                />
                            ) : (
                                '提交'
                            )}
                        </Button>
                        <Button
                            sx={{ mt: 1 }}
                            fullWidth
                            onClick={() =>
                                setForm({
                                    page: 0,
                                    data: null
                                })
                            }>
                            返回登录
                        </Button>
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography
                                variant={'body2'}
                                color={'text.secondary'}
                                sx={{
                                    fontSize: '0.85rem',
                                    opacity: 0.8
                                }}>
                                © {new Date().getFullYear()} CarreFour Admin.
                                All rights reserved.
                            </Typography>
                        </Box>
                    </Paper>
                </Slide>
            </Container>
        </Fade>
    );
};

export default TwoFactorForm;
