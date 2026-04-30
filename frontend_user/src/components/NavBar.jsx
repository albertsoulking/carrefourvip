import { Box, Grid, Button, Typography } from '@mui/material';
import assets from '../assets';
import web from '../routes/web';
import { useSmartNavigate } from '../hooks/useSmartNavigate';

const NavBar = ({ categories, setOpenMenu }) => {
    const navigate = useSmartNavigate();

    return (
        <Grid
            container
            direction={'column'}
            flexWrap={'nowrap'}
            alignItems={'flex-start'}
            sx={{
                overflow: 'auto',
                gap: 0.75,
                p: 1.25
            }}>
            {/* <Grid sx={{ display: { sm: 'flex', md: 'none' } }}>
                <Button
                    startIcon={<LocationOnRounded sx={{ color: '#fa6833' }} />}
                    sx={{
                        color: '#fa6833',
                        textTransform: 'none',
                        fontSize: 14,
                        fontWeight: 200,
                        fontFamily: 'Quicksand, sans-serif',
                        '.MuiButton-startIcon': { m: 0 }
                    }}
                    fullWidth
                    onClick={onLocationClick}
                    disableRipple>
                    {location === '' || location === null
                        ? 'Please allow your location'
                        : location}
                </Button>
            </Grid> */}
            <Button
                key={0}
                fullWidth
                size={'small'}
                sx={{
                    px: 1.25,
                    py: 1,
                    fontSize: 14,
                    fontWeight: 'bold',
                    justifyContent: 'flex-start',
                    textTransform: 'capitalize',
                    display: 'flex',
                    color: 'var(--brand-ink)',
                    bgcolor: 'var(--brand-paper)',
                    border: '1px solid var(--brand-line)',
                    borderRadius: 'var(--brand-radius-md)',
                    transition: '0.2s',
                    '&:hover': {
                        borderColor: 'var(--brand-forest)',
                        bgcolor: 'var(--brand-paper)'
                    },
                    '&.MuiButton-text': {
                        borderRadius: 'var(--brand-radius-md)'
                    }
                }}
                startIcon={
                    <img
                        src={assets.logo}
                        style={{
                            objectFit: 'contain',
                            width: 30,
                            height: 30
                        }}
                    />
                }
                onClick={() => {
                    setOpenMenu(false);

                    const params = new URLSearchParams({
                        category: 0
                    }).toString();

                    navigate(web.products + '?' + params);
                }}>
                <Typography fontWeight={800}>All Products</Typography>
            </Button>
            {categories.map((item) => (
                <Button
                    key={item.id}
                    fullWidth
                    size={'small'}
                    sx={{
                        px: 1.25,
                        py: 1,
                        fontSize: 14,
                        fontWeight: 'bold',
                        justifyContent: 'flex-start',
                        textTransform: 'capitalize',
                        display: 'flex',
                        color: 'var(--brand-ink)',
                        bgcolor: 'var(--brand-paper)',
                        border: '1px solid var(--brand-line)',
                        borderRadius: 'var(--brand-radius-md)',
                        transition: '0.2s',
                        '&:hover': {
                            borderColor: 'var(--brand-forest)',
                            bgcolor: 'var(--brand-paper)'
                        },
                        '&.MuiButton-text': {
                            borderRadius: 'var(--brand-radius-md)'
                        }
                    }}
                    startIcon={
                        <img
                            src={`${
                                import.meta.env.VITE_API_BASE_URL
                            }/uploads/thumbs/${item.imageUrl}`}
                            style={{
                                objectFit: 'contain',
                                width: 30,
                                height: 30
                            }}
                        />
                    }
                    onClick={() => {
                        setOpenMenu(false);

                        const params = new URLSearchParams({
                            category: item.id
                        });

                        navigate(web.products + '?' + params);
                    }}>
                    <Box
                        component={'span'}
                        sx={{
                            display: item.name ? 'inline' : 'none',
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                        {item.name}
                    </Box>
                </Button>
            ))}
        </Grid>
    );
};

export default NavBar;
