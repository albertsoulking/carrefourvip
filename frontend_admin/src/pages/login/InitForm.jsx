import { useState } from 'react';
import {
    AdminPanelSettingsRounded,
    AutoAwesomeRounded,
    CheckCircleOutlineRounded
} from '@mui/icons-material';
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
    Typography,
    useTheme
} from '@mui/material';
import api from '../../routes/api';

const InitForm = ({ setIsInit }) => {
    const theme = useTheme();
    const [step, setStep] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (step === 0) {
                await api.utilities.init();

                setTimeout(() => setStep(1), 2000);
                setTimeout(() => setStep(2), 4000);
                setTimeout(() => setStep(3), 6000);
                setTimeout(() => setStep(4), 9000);
                setTimeout(() => setStep(5), 12000);
            } else {
                setIsInit(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || '网络异常！');
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 13000);
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
                                超级管理员后台
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
                            component={'form'}
                            onSubmit={handleSubmit}
                            sx={{ width: '100%' }}>
                            <Typography textAlign={'center'}>
                                初始化家乐福VIP网站
                            </Typography>

                            {step >= 1 && (
                                <Box
                                    sx={{
                                        display: 'flex',

                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                    {step === 1 ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <CheckCircleOutlineRounded
                                            fontSize={'small'}
                                            color={'primary'}
                                        />
                                    )}
                                    <Typography
                                        variant='body2'
                                        sx={{
                                            ml: step === 1 ? 0.5 : 0,
                                            opacity: 0.85
                                        }}>
                                        角色初始化…
                                    </Typography>
                                </Box>
                            )}
                            {step >= 2 && (
                                <Box
                                    sx={{
                                        display: 'flex',

                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                    {step === 2 ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <CheckCircleOutlineRounded
                                            fontSize={'small'}
                                            color={'primary'}
                                        />
                                    )}
                                    <Typography
                                        variant='body2'
                                        sx={{
                                            ml: step === 2 ? 0.5 : 0,
                                            opacity: 0.85
                                        }}>
                                        菜单初始化…
                                    </Typography>
                                </Box>
                            )}
                            {step >= 3 && (
                                <Box
                                    sx={{
                                        display: 'flex',

                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                    {step === 3 ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <CheckCircleOutlineRounded
                                            fontSize={'small'}
                                            color={'primary'}
                                        />
                                    )}
                                    <Typography
                                        variant='body2'
                                        sx={{
                                            ml: step === 3 ? 0.5 : 0,
                                            opacity: 0.85
                                        }}>
                                        权限初始化…
                                    </Typography>
                                </Box>
                            )}
                            {step >= 4 && (
                                <Box
                                    sx={{
                                        display: 'flex',

                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                    {step === 4 ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <CheckCircleOutlineRounded
                                            fontSize={'small'}
                                            color={'primary'}
                                        />
                                    )}
                                    <Typography
                                        variant='body2'
                                        sx={{
                                            ml: step === 4 ? 0.5 : 0,
                                            opacity: 0.85
                                        }}>
                                        管理员账号初始化…
                                    </Typography>
                                </Box>
                            )}
                            {step === 5 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography
                                        variant='body2'
                                        color='success.main'>
                                        管理员账号: admin
                                    </Typography>
                                    <Typography
                                        variant='body2'
                                        color='success.main'>
                                        管理员密码: admin123
                                    </Typography>
                                </Box>
                            )}
                            <Button
                                type={'submit'}
                                fullWidth
                                variant={'contained'}
                                color={'primary'}
                                size={'large'}
                                disabled={loading}
                                startIcon={
                                    !loading && (
                                        <AutoAwesomeRounded fontSize={'inherit'} />
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
                                ) : step === 5 ? (
                                    '下一步'
                                ) : (
                                    '开始'
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
                                    © {new Date().getFullYear()} CarreFour VIP
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

export default InitForm;
