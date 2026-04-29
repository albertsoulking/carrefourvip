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
                width: '100%',
                minHeight: 58,
                display: 'flex',
                boxShadow: 'var(--brand-shadow)',
                zIndex: 10,
                maxWidth: 'sm',
                m: '0 auto',
                bgcolor: 'var(--brand-paper)',
                borderTop: '1px solid var(--brand-line)',
                px: 1,
                py: 1,
                gap: 1
            }}>
            {/* 每个区域都倾斜 + 背景色 */}
            <Box
                sx={{
                    flex: 1,
                    height: '100%',
                    backgroundColor: 'var(--brand-cream)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-ink)',
                    border: '1px solid var(--brand-line)',
                    borderRadius: 'var(--brand-radius-md)'
                }}>
                <Typography
                    variant={'h5'}
                    fontWeight={'bold'}
                    translate={'no'}
                    sx={{ color: 'var(--brand-ink)' }}>
                    {data?.price &&
                        useStyledLocaleString(data?.price, user?.geoInfo)}
                </Typography>
            </Box>
            <Box
                sx={{
                    width: 58,
                    height: '100%',
                    backgroundColor: 'var(--brand-cream)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-forest)',
                    cursor: 'pointer',
                    border: '1px solid var(--brand-line)',
                    borderRadius: 'var(--brand-radius-md)'
                }}
                onClick={handleOnFavoriteClick}>
                {favorite ? (
                    <FavoriteRounded
                        color={'error'}
                    />
                ) : (
                    <FavoriteBorderRounded />
                )}
            </Box>
            <Box
                sx={{
                    width: 72,
                    height: '100%',
                    backgroundColor: 'var(--brand-forest)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer',
                    borderRadius: 'var(--brand-radius-md)'
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
