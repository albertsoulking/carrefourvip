import { Box, Typography } from '@mui/material';
import assets from '../../assets';

const CategoryHeader = ({ data }) => {
    const height = 100;
    
    return (
        <Box
            position={'relative'}
            height={height}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            zIndex={888}>
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
                    borderRadius: 8
                }}
            />
            <Typography
                variant={'h5'}
                fontWeight={'bold'}
                textAlign={'center'}
                sx={{ color: '#fff', textShadow: '3px 3px 6px #000' }}>
                {data?.name ?? 'All Products'}
            </Typography>
        </Box>
    );
};

export default CategoryHeader;
