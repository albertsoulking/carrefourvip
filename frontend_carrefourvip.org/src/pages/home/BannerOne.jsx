import { Grid, Typography } from '@mui/material';
import BannerTwo from './BannerTwo';
import { useTranslation } from 'react-i18next';

const BannerOne = ({ banners }) => {
    const { t } = useTranslation();

    const getTodayImageIndex = (total) => {
        const today = new Date();
        // 格式化成 yyyy-mm-dd
        const dateStr = today.toISOString().slice(0, 10);

        // 把日期字符串转成哈希数字
        let hash = 0;
        for (let i = 0; i < dateStr.length; i++) {
            hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
        }

        // 保证结果在 0 ~ TOTAL
        return Math.abs(hash) % total;
    };
    
    return (
        <Grid
            sx={{
                position: 'relative',
                zIndex: 1
            }}>
            <Grid sx={{ position: 'absolute', zIndex: -1, width: '100%' }}>
                <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/uploads/images/${
                        banners[getTodayImageIndex(banners.length)]
                    }`}
                    style={{
                        width: '100%',
                        height: '13rem',
                        objectFit: 'cover'
                    }}
                    alt={'homepage banner'}
                />
            </Grid>
            <Grid
                container
                direction={'column'}
                justifyContent={'center'}
                alignItems={'center'}
                sx={{
                    pt: '1.5rem'
                }}>
                <Grid
                    container
                    direction={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    sx={{
                        mt: 3,
                        width: { xs: '100%', sm: '70%' }
                    }}>
                    <Typography
                        variant={'h1'}
                        fontSize={{ xs: 30, sm: 50 }}
                        fontWeight={'bold'}
                        textAlign={'center'}
                        sx={{
                            color: '#fff',
                            textShadow: '2px 2px 4px rgba(0,0,0,1)'
                        }}>
                        {t('home.bannerOne.welcome')}
                    </Typography>
                </Grid>
                <BannerTwo />
            </Grid>
        </Grid>
    );
};

export default BannerOne;
