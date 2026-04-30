import { Box, Typography } from '@mui/material';
import assets from '../../assets';

const CategoryHeader = ({ data }) => {
    const height = 118;
    
    return (
        <Box
            position={'relative'}
            minHeight={height}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            zIndex={1}
            sx={{
                overflow: 'hidden',
                borderRadius: 'var(--brand-radius-lg)',
                border: '1px solid var(--brand-line)',
                boxShadow: 'var(--brand-shadow)',
                bgcolor: 'var(--brand-paper)'
            }}>
            <img
                src={
                    data?.bgImageUrl
                        ? `${
                              import.meta.env.VITE_API_BASE_URL
                          }/uploads/images/${data?.bgImageUrl}`
                        : assets.b11
                }
                alt={data?.name}
                style={{
                    width: '100%',
                    height,
                    objectFit: 'cover',
                    position: 'absolute',
                    zIndex: -1,
                    filter: 'saturate(0.98)'
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: -1,
                    background:
                        'linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.52))'
                }}
            />
            <Typography
                variant={'h5'}
                fontWeight={'bold'}
                textAlign={'center'}
                sx={{
                    px: 2,
                    color: '#fff',
                    fontFamily: 'var(--font-display)',
                    textShadow: '0 2px 8px rgba(0,0,0,0.35)'
                }}>
                {data?.name ?? 'All Products'}
            </Typography>
        </Box>
    );
};

export default CategoryHeader;
