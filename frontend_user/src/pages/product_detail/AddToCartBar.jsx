import {
    AddShoppingCartRounded,
    FavoriteBorderRounded,
    FavoriteRounded
} from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import api from '../../routes/api';
import { useEffect, useState } from 'react';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import { enqueueSnackbar } from 'notistack';
import DrawerAttribute from './DrawerAttribute';

const AddToCartBar = ({ data }) => {
    const [favorite, setFavorite] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const [openDrawer, setOpenDrawer] = useState(false);

    useEffect(() => {
        // const defaultSelected = attrs
        //     .filter((attr) => attr.items.length > 0)
        //     .map((attr, index) => ({
        //         attrIndex: index,
        //         itemIndex: 0,
        //         itemPrice: Number(attr.items[0].price)
        //     }));
        setFavorite(data?.isFavorite);
        // setSelected(defaultSelected);
    }, [data, openDrawer]);

    const handleOnFavoriteClick = async () => {
        try {
            const payload = {
                productId: data?.id
            };

            if (favorite) {
                await api.favorites.deleteOne(payload);
            } else {
                await api.favorites.createOne(payload);
            }
            setFavorite((prev) => !prev);
        } catch (error) {
            enqueueSnackbar(
                Array.isArray(error.response?.data?.message)
                    ? error.response.data.message[0]
                    : error.response?.data?.message || error.message,
                {
                    variant: 'error'
                }
            );
        }
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                width: '103%',
                height: 40,
                display: 'flex',
                boxShadow: 'rgba(0, 0, 0, 0.2) 0 0 12px',
                zIndex: 10,
                maxWidth: 'sm',
                m: '0 auto',
                bgcolor: '#000'
            }}>
            {/* 每个区域都倾斜 + 背景色 */}
            <Box
                sx={{
                    width: '55%',
                    height: '100%',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                <Typography
                    variant={'h5'}
                    fontWeight={'bold'}
                    translate={'no'}
                    sx={{ color: '#000' }}>
                    {data?.price &&
                        useStyledLocaleString(data?.price, user?.geoInfo)}
                </Typography>
            </Box>
            <Box
                sx={{
                    width: '25%',
                    height: '100%',
                    backgroundColor: '#3fbb2a',
                    transform: 'skewX(-15deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    mx: -1,
                    cursor: 'pointer'
                }}
                onClick={handleOnFavoriteClick}>
                {favorite ? (
                    <FavoriteRounded
                        color={'error'}
                        sx={{ transform: 'skewX(15deg)' }}
                    />
                ) : (
                    <FavoriteBorderRounded sx={{ transform: 'skewX(15deg)' }} />
                )}
            </Box>
            <Box
                sx={{
                    width: '25%',
                    height: '100%',
                    backgroundColor: '#2196f3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer'
                }}
                onClick={() => setOpenDrawer(true)}>
                <AddShoppingCartRounded />
            </Box>
            <DrawerAttribute
                open={openDrawer}
                data={data}
                setOpen={setOpenDrawer}
            />
        </Box>
    );
};

export default AddToCartBar;
