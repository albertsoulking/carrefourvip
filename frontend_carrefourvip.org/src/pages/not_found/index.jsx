import { Box, Grid, Typography, Button } from '@mui/material';
import web from '../../routes/web';
import assets from '../../assets';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

const NotFoundPage = () => {
    const navigate = useSmartNavigate();

    return (
        <Grid sx={{ width: '100%', position: 'relative' }}>
            <Box textAlign={'center'}>
                <Grid sx={{ position: 'absolute', top: 0, right: 0 }}>
                    <img
                        src={assets.element2}
                        alt=''
                        style={{ objectFit: 'cover' }}
                    />
                </Grid>
                <Typography
                    noWrap
                    variant={'h1'}
                    fontWeight={'bold'}
                    color={'primary'}
                    sx={{ fontSize: '10rem' }}>
                    404
                </Typography>
                <Typography
                    noWrap
                    variant={'h6'}
                    sx={{ mb: 4 }}>
                    Page you are looking have been expired
                </Typography>
                <Button
                    variant={'contained'}
                    size={'large'}
                    sx={{
                        width: '10rem',
                        fontWeight: 'bold',
                        transition: '0.6s',
                        color: '#fff',
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
