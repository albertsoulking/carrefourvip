import { Box, Grid, Typography, Button } from '@mui/material';
import web from '../../routes/web';
import assets from '../../assets';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

const NotFoundPage = () => {
    const navigate = useSmartNavigate();

    return (
        <Grid
            sx={{
                width: '100%',
                minHeight: '100vh',
                position: 'relative',
                bgcolor: 'var(--brand-cream)',
                display: 'grid',
                placeItems: 'center',
                px: 2
            }}>
            <Box
                textAlign={'center'}
                sx={{
                    width: '100%',
                    p: 3,
                    borderRadius: '28px',
                    bgcolor: '#fffdfa',
                    border: '1px solid var(--brand-line)',
                    boxShadow: 'var(--brand-shadow)'
                }}>
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
                    sx={{
                        fontSize: { xs: '7rem', sm: '10rem' },
                        color: 'var(--brand-forest)',
                        fontFamily: 'var(--font-display)'
                    }}>
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
