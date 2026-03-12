import {
    Card,
    CardActionArea,
    CardContent,
    Grid,
    Typography
} from '@mui/material';
import assets from '../../assets';
import web from '../../routes/web';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

const BannerFour = () => {
    const navigate = useSmartNavigate();
    const offers = [
        {
            img: assets.food,
            text: 'Every bite is delicious and full of flavor',
            title: 'Best-selling Foods',
            category: 2
        },
        {
            img: assets.adult,
            text: 'Bring endless joy to your life',
            title: 'Adult Products',
            category: 1
        }
    ];

    const handleOnClick = (category) => {
        const params = new URLSearchParams({
            c: category
        });

        navigate(web.products + '?' + params);
    };

    return (
        <Grid
            sx={{
                position: 'relative',
                overflow: 'hidden'
            }}>
            <Grid
                container
                direction={'column'}
                justifyContent={'center'}
                alignItems={'center'}
                sx={{
                    py: '1rem'
                }}>
                <Grid
                    container
                    direction={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    sx={{
                        width: '70%'
                    }}>
                    <Typography
                        fontSize={18}
                        textAlign={'center'}
                        color={'primary'}
                        sx={{
                            fontFamily: '"Alex Brush", cursive'
                        }}>
                        Hot Sale Recommendation
                    </Typography>
                    <Typography
                        variant={'h1'}
                        fontSize={14}
                        fontWeight={'bold'}
                        textAlign={'center'}
                        sx={{ color: '#211f28cc' }}>
                        Don't miss out on our best-selling products!
                    </Typography>
                </Grid>
                <Grid
                    container
                    justifyContent={'center'}
                    alignItems={'center'}
                    sx={{ width: '100%' }}>
                    {/* <img
                        src={assets.paypalDiscount5}
                        style={{
                            width: isMobile? '80%' : '50%',
                            objectFit: 'contain'
                        }}
                    /> */}
                    {offers.map((item, index) => (
                        <Grid
                            key={index}
                            size={{ xs: 10 }}
                            sx={{ m: 1, p: 0 }}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    border: '1px solid #ddd',
                                    m: '0 auto'
                                }}>
                                <CardActionArea
                                    sx={{ p: { xs: 0, sm: 0 } }}
                                    onClick={() =>
                                        handleOnClick(item.category)
                                    }>
                                    <CardContent sx={{ display: 'flex', p: 0 }}>
                                        <Grid
                                            size={{ xs: 4 }}
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                transition: '0.3s ease'
                                            }}>
                                            <img
                                                src={item.img}
                                                alt=''
                                                style={{
                                                    objectFit: 'contain',
                                                    width: '100%',
                                                    height: '100%'
                                                }}
                                            />
                                        </Grid>
                                        <Grid
                                            size={{ xs: 8 }}
                                            sx={{ p: 2 }}>
                                            <Typography
                                                sx={{
                                                    pt: 2,
                                                    fontSize: 18,
                                                    color: '#211f28',
                                                    fontWeight: 900
                                                }}>
                                                <span
                                                    style={{
                                                        display: item.title
                                                            ? 'inline'
                                                            : 'none'
                                                    }}>
                                                    {item.title}
                                                </span>
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    pt: 1,
                                                    fontSize: 14,
                                                    fontFamily:
                                                        '"Alex Brush", cursive',
                                                    color: '#211f28'
                                                }}>
                                                <span
                                                    style={{
                                                        display: item.text
                                                            ? 'inline'
                                                            : 'none'
                                                    }}>
                                                    {item.text}
                                                </span>
                                            </Typography>
                                        </Grid>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default BannerFour;
