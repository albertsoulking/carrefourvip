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
                p: 1.5,
                zIndex: 999,
                bgcolor: 'rgb(255 255 255 / 80%)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0px 3px 10px -2px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
            elevation={3}>
            {noBack ? (
                <Box flexGrow={0.3}></Box>
            ) : (
                <Button
                    size={'small'}
                    startIcon={<ArrowBackIosNewRounded fontSize={'small'} />}
                    sx={{ textTransform: 'capitalize', p: 0, fontSize: 16 }}
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
            <Typography>{title}</Typography>
            {/* {btn} */}
            {btn ?? <Box flexGrow={0.3}></Box>}
        </Paper>
    );
};

export default TopNavigator;
