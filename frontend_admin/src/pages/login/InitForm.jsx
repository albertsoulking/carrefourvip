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

                setTimeout(() => setStep(1), 1000);
                setTimeout(() => setStep(2), 3000);
                setTimeout(() => setStep(3), 5000);
                setTimeout(() => setStep(4), 7000);
                setTimeout(() => setStep(5), 9000);
                setTimeout(() => setStep(6), 11000);
                setTimeout(() => setStep(7), 13000);
            } else {
                setIsInit(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || '网络异常！');
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 14000);
        }
    };

    const initSteps = [
        { visibleAt: 1, activeAt: 1, label: '角色初始化…' },
        { visibleAt: 2, activeAt: 2, label: '菜单初始化…' },
        { visibleAt: 3, activeAt: 3, label: '权限初始化…' },
        { visibleAt: 4, activeAt: 4, label: '支付网关初始化…' },
        { visibleAt: 5, activeAt: 5, label: '配送信息初始化…' },
        { visibleAt: 6, activeAt: 6, label: '管理员账号初始化…' }
    ];

    const renderStepItem = ({ visibleAt, activeAt, label }) => {
        if (step < visibleAt) return null;

        const isActive = step === activeAt;

        return (
            <Box
                key={label}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                {isActive ? (
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
                        ml: isActive ? 0.5 : 0,
                        opacity: 0.85
                    }}>
                    {label}
                </Typography>
            </Box>
        );
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
                                初始化加乐福网站
                            </Typography>

                            {initSteps.map(renderStepItem)}
                            {step === 7 && (
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
                                ) : step === 7 ? (
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
                                    © {new Date().getFullYear()} Kalefu
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
