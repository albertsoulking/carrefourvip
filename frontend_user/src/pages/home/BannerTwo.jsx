import { Button, Card, CardContent, Grid, Typography } from '@mui/material';
import assets from '../../assets';
import web from '../../routes/web';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { useTranslation } from '../../../node_modules/react-i18next';

const BannerTwo = () => {
    const navigate = useSmartNavigate();
    const { t } = useTranslation();

    return (
        <Grid
            sx={{
                pt: -2,
                position: 'relative',
                overflow: 'hidden'
            }}>
            <Grid
                container
                direction={'column'}
                justifyContent={'center'}
                alignItems={'center'}
                sx={{
                    p: '1rem'
                }}>
                <Grid
                    container
                    justifyContent={'center'}
                    alignItems={'center'}
                    spacing={4}>
                    <Grid size={{ xs: 12 }}>
                        <Card
                            elevation={0}
                            sx={{
                                maxHeight: 300,
                                borderRadius: 4,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1,
                                boxShadow: 'rgba(0, 0, 0, 0.1) 0 4px 12px'
                            }}>
                            <CardContent>
                                <Typography
                                    variant={'h6'}
                                    fontWeight={'bold'}>
                                    {t('home.bannerTwo.start')}
                                </Typography>
                                <Typography
                                    variant={'body2'}
                                    fontSize={12}
                                    mt={1}>
                                    {t('home.bannerTwo.desc')}
                                </Typography>
                                <Button
                                    variant={'contained'}
                                    sx={{
                                        mt: 1,
                                        fontSize: 12
                                    }}
                                    fullWidth
                                    onClick={() => navigate(web.products)}>
                                    {t('home.bannerTwo.btn')}
                                </Button>
                            </CardContent>
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                webkit-playsinline={'true'}
                                src={assets.login_vid}
                                style={{
                                    borderRadius: '8px',
                                    width: '50%',
                                    objectFit: 'cover',
                                    marginRight: 4
                                }}>
                                <source
                                    src={assets.login_vid}
                                    type={'video/mp4'}
                                />
                            </video>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default BannerTwo;
