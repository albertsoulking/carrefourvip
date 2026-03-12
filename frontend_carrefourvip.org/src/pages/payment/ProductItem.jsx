import { Box, Badge, Typography } from '@mui/material';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';

const ProductItem = ({ data, setOpen }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <Box
            display={'flex'}
            flexWrap={'nowrap'}
            justifyContent={'space-between'}
            mb={1}>
            <Box display={'flex'}>
                <Box position={'relative'}>
                    <img
                        src={`${
                            import.meta.env.VITE_API_BASE_URL
                        }/uploads/thumbs/${data.productImage}`}
                        alt={'Preview'}
                        style={{
                            width: 80,
                            height: 70,
                            objectFit: 'cover',
                            backgroundColor: '#000',
                            borderRadius: 8,
                            marginBottom: 4,
                            cursor: 'pointer',
                            boxShadow: 'rgba(0, 0, 0, 0.4) 0 4px 8px'
                        }}
                        onClick={() =>
                            setOpen({ open: true, data: data.productImage })
                        }
                    />
                    <Badge
                        badgeContent={data.quantity}
                        color={'primary'}
                        overlap={'circular'}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 5,
                            transition: '0.6s ease'
                        }}
                    />
                </Box>
                <Typography
                    variant={'body2'}
                    mx={1}
                    pl={1}>
                    {data.productName}
                </Typography>
            </Box>
            <Box display={'flex'}>
                <Typography
                    variant={'body2'}
                    translate={'no'}
                    textAlign={'right'}>
                    {useStyledLocaleString(data.totalPrice, user?.geoInfo)}
                </Typography>
            </Box>
        </Box>
    );
};

export default ProductItem;
