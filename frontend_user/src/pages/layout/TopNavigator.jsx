import { Box, Button, Paper, Typography } from '@mui/material';
import { ArrowBackIosNewRounded } from '@mui/icons-material';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

const TopNavigator = ({
    setOpen,
    backText = 'Back',
    backPath = -1,
    title,
    btn,
    noBack = false
}) => {
    const navigate = useSmartNavigate();

    return (
        <Paper
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                maxWidth: 'sm',
                m: '0 auto',
                px: 2,
                py: 1.35,
                zIndex: 999,
                bgcolor: 'rgba(247, 242, 232, 0.86)',
                backdropFilter: 'blur(18px)',
                borderRadius: 0,
                border: 0,
                borderBottom: '1px solid var(--brand-line)',
                boxShadow: '0 10px 24px rgba(23, 57, 44, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
            elevation={0}>
            {noBack ? (
                <Box flexGrow={0.3}></Box>
            ) : (
                <Button
                    size={'small'}
                    startIcon={<ArrowBackIosNewRounded fontSize={'small'} />}
                    sx={{
                        color: 'var(--brand-forest)',
                        textTransform: 'none',
                        p: 0,
                        fontSize: 15,
                        fontWeight: 800
                    }}
                    onClick={() => {
                        if (setOpen) {
                            setOpen(false);
                        } else {
                            navigate(backPath);
                        }
                    }}>
                    {backText}
                </Button>
            )}
            <Typography
                sx={{
                    color: 'var(--brand-ink)',
                    fontWeight: 800,
                    fontSize: 16
                }}>
                {title}
            </Typography>
            {/* {btn} */}
            {btn ?? <Box flexGrow={0.3}></Box>}
        </Paper>
    );
};

export default TopNavigator;
