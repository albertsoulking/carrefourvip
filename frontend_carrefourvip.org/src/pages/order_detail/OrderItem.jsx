import { Badge, Box, Chip, Typography } from '@mui/material';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import ModalViewImage from './ModalViewImage';
import { useState } from 'react';

const OrderItem = ({ data }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [openImage, setOpenImage] = useState(false);

    return (
        <Box
            display={'flex'}
            flexWrap={'nowrap'}
            mb={1}>
            <Box position={'relative'}>
                <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/uploads/thumbs/${
                        data.productImage
                    }`}
                    alt={'Preview'}
                    style={{
                        width: 70,
                        height: 70,
                        objectFit: 'cover',
                        backgroundColor: '#000',
                        borderRadius: 8,
                        marginBottom: 8,
                        cursor: 'pointer',
                        boxShadow: 'rgba(0, 0, 0, 0.4) 0 4px 8px'
                    }}
                    onClick={() => setOpenImage(true)}
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
            <Box
                display={'flex'}
                flexDirection={'column'}
                ml={2}
                width={'100%'}>
                <Typography
                    variant={'body2'}
                    mr={2}>
                    {data.productName}
                </Typography>
                <Chip
                    label={data.categoryName}
                    size={'small'}
                    sx={{ width: 'fit-content', mt: 0.5 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        const params = new URLSearchParams({
                            c: data.category?.id
                        });

                        navigate(web.products + '?' + params);
                    }}
                />
            </Box>{' '}
            <Typography
                variant={'body1'}
                translate={'no'}
                textAlign={'right'}>
                {useStyledLocaleString(data.totalPrice, user?.geoInfo)}
            </Typography>
            <ModalViewImage
                open={openImage}
                image={data.productImage}
                setOpen={setOpenImage}
            />
        </Box>
    );
};

export default OrderItem;
