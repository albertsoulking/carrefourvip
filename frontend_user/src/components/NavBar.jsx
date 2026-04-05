import { Grid, Button } from '@mui/material';
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
            sx={{ overflow: 'overlay' }}>
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
                    px: 1,
                    fontSize: 14,
                    fontWeight: 'bold',
                    justifyContent: 'flex-start',
                    textTransform: 'capitalize',
                    display: 'flex',
                    borderBottom: '2px solid transparent',
                    transition: 'border-bottom-color 0.2s',
                    '&:hover': {
                        borderBottom: '2px solid #1976d2'
                    },
                    '&.MuiButton-text': {
                        borderRadius: 0
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
                        c: 0
                    }).toString();

                    navigate(web.products + '?' + params);
                }}>
                All
            </Button>
            {categories.map((item) => (
                <Button
                    key={item.id}
                    fullWidth
                    size={'small'}
                    sx={{
                        px: 1,
                        fontSize: 14,
                        fontWeight: 'bold',
                        justifyContent: 'flex-start',
                        textTransform: 'capitalize',
                        display: 'flex',
                        borderBottom: '2px solid transparent',
                        transition: 'border-bottom-color 0.2s',
                        '&:hover': {
                            borderBottom: '2px solid #1976d2'
                        },
                        '&.MuiButton-text': {
                            borderRadius: 0
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
                            c: item.id
                        });

                        navigate(web.products + '?' + params);
                    }}>
                    <span style={{ display: item.name ? 'inline' : 'none' }}>
                        {item.name}
                    </span>
                </Button>
            ))}
        </Grid>
    );
};

export default NavBar;
