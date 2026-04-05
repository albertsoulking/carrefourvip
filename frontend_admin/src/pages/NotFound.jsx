import { Box, Grid, Typography, Button } from '@mui/material';
import web from '../routes/web';
import { useSmartNavigate } from '../hooks/useSmartNavigate';

const NotFoundPage = () => {
    const navigate = useSmartNavigate();

    return (
        <Grid sx={{ width: '100%', position: 'relative' }}>
            <Box textAlign={'center'}>
                <Typography
                    noWrap
                    variant={'h1'}
                    fontWeight='bold'
                    sx={{ fontSize: '10rem', color: '#ffa805' }}>
                    404
                </Typography>
                <Typography
                    noWrap
                    variant={'h4'}
                    sx={{ mb: 4 }}>
                    Page you are looking have been expired
                </Typography>
                <Button
                    variant={'contained'}
                    size={'large'}
                    sx={{
                        width: '10rem',
                        fontWeight: 'bold',
                        bgcolor: '#ffa805',
                        border: '1px solid #ffa805',
                        transition: '0.6s',
                        color: '#fff',
                        borderRadius: 25,
                        boxShadow: 'none'
                    }}
                    onClick={() => navigate(web.home)}>
                    Back to home
                </Button>
            </Box>
        </Grid>
    );
};

export default NotFoundPage;
