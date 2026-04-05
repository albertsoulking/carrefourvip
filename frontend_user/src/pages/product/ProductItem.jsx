import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    Typography,
    CardMedia,
    CircularProgress,
    Chip,
    Drawer,
    Skeleton
} from '@mui/material';
import api from '../../routes/api';
import {
    FavoriteBorderRounded,
    FavoriteRounded,
    AddShoppingCartRounded
} from '@mui/icons-material';
import web from '../../routes/web';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { enqueueSnackbar } from 'notistack';
import ProductDetailPage from '../product_detail';

const ProductItem = ({ data, doubleRow }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useSmartNavigate();
    const [favorite, setFavorite] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [selectedAttr, setSelectedAttr] = useState({});
    const [quantity] = useState(1);

    useEffect(() => {
        const attrs = JSON.parse(data?.attributes || '[]');
        setFavorite(data?.isFavorite);
        setSelectedAttr(attrs.length > 0 ? attrs[0] : {});
    }, [data]);

    const handleOnFavoriteClick = async (e) => {
        e.stopPropagation();
        const payload = {
            productId: data?.id
        };

        try {
            if (favorite) {
                await api.favorites.deleteOne(payload);
                setFavorite(false);
            } else {
                await api.favorites.createOne(payload);
                setFavorite(true);
            }
        } catch (err) {
            enqueueSnackbar('Something went wrong. Please try again!', {
                variant: 'error'
            });
        }
    };

    const handleOnAddToCart = async () => {
        let payload = {
            productId: data?.id,
            imageUrl: data?.imageUrl,
            quantity,
            attributes: JSON.stringify(selectedAttr),
            basePrice: data?.price,
            attrPrice: getAttrPrice(),
            unitPrice: getUnitPrice(),
            totalPrice: getTotalPrice()
        };

        setLoading(true);

        try {
            await api.carts.createOne(payload);

            setTimeout(async () => {
                setLoading(false);
            }, 500);
        } catch (error) {
            setLoading(false);
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

    const getAttrPrice = () => {
        const attrPrice = selectedAttr.price || 0;
        return attrPrice.toString();
    };

    const getUnitPrice = () => {
        const unitPrice = Number(data?.price || 0) + Number(getAttrPrice());
        return unitPrice.toString();
    };

    const getTotalPrice = () => {
        const totalPrice = quantity * Number(getUnitPrice());
        return totalPrice.toString();
    };

    return (
        <Card
            elevation={0}
            sx={{
                position: 'relative',
                borderRadius: 2,
                transition: '0.3s ease',
                border: '1px solid #0000001a',
                ':hover': { boxShadow: 'rgba(0, 0, 0, 0.2) 0 4px 12px' },
                '&.MuiCard-root': {
                    overflow: 'hidden'
                }
            }}>
            {/* 右上角收藏角标 */}
            <Box
                sx={{
                    display: user ? 'flex' : 'none',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 0,
                    height: 0,
                    borderTop: '45px solid #dcdfe1', // 三角形颜色
                    borderLeft: '45px solid transparent',
                    borderTopRightRadius: 8,
                    zIndex: 1
                }}>
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: -40,
                        right: 5,
                        transition: '0.2s linear',
                        p: 0
                    }}
                    size={'small'}
                    onClick={handleOnFavoriteClick}
                    disableRipple>
                    {favorite === null || !favorite ? (
                        <FavoriteBorderRounded fontSize={'small'} />
                    ) : (
                        <FavoriteRounded
                            fontSize={'small'}
                            color={'error'}
                        />
                    )}
                </IconButton>
            </Box>
            <CardContent
                sx={{
                    display: doubleRow ? 'inline' : 'flex',
                    cursor: 'pointer',
                    ':last-child': { pb: 0 },
                    p: 0
                }}
                onClick={() => setOpenDetail({ open: true, data })}>
                <Box
                    width={doubleRow ? '100%' : '55%'}
                    height={200}
                    position={'relative'}>
                    {!loaded && (
                        <Skeleton
                            variant='rectangular'
                            width={doubleRow ? '100%' : '55%'}
                            height={200}
                            sx={{ position: 'absolute', top: 0, left: 0 }}
                        />
                    )}
                    <Box
                        component={'img'}
                        src={`${
                            import.meta.env.VITE_API_BASE_URL
                        }/uploads/thumbs/${data?.imageUrl}`}
                        alt={data?.name}
                        width={doubleRow ? '100%' : '55%'}
                        height={'100%'}
                        display={loaded ? 'flex' : 'none'}
                        sx={{
                            objectFit: 'cover',
                            cursor: 'pointer',
                            transition: '0.6s ease'
                        }}
                        onLoad={() => setLoaded(true)}
                        onError={() => setLoaded(true)}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenDetail({ open: true, data });
                        }}
                    />
                </Box>
                <Box
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'space-between'}
                    width={'100%'}
                    sx={{ p: 1 }}>
                    <Typography
                        gutterBottom
                        variant={'body2'}
                        component={'div'}
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            userSelect: 'text',
                            cursor: 'pointer',
                            ':hover': {
                                textDecoration: 'underline'
                            }
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenDetail({ open: true, data });
                        }}>
                        <span
                            style={{
                                display: data.name ? 'inline' : 'none'
                            }}>
                            {data.name}
                        </span>
                    </Typography>
                    <Chip
                        label={data?.category.name}
                        size={'small'}
                        sx={{ width: 'fit-content', mt: 0.5 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            const params = new URLSearchParams({
                                category: data.category?.id
                            });

                            navigate(web.products + '?' + params);
                        }}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                        <Typography
                            variant={'h5'}
                            fontWeight={'bold'}
                            translate={'no'}>
                            {useStyledLocaleString(data.price, user?.geoInfo)}
                        </Typography>
                        <Button
                            size={'small'}
                            variant={'contained'}
                            sx={{ minWidth: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOnAddToCart(data);
                            }}>
                            {loading ? (
                                <CircularProgress
                                    size={'small'}
                                    sx={{
                                        width: '24px !important',
                                        height: '24px !important',
                                        color: '#fff'
                                    }}
                                />
                            ) : (
                                <AddShoppingCartRounded
                                    sx={{ color: '#fff' }}
                                />
                            )}
                        </Button>
                    </Box>
                </Box>
            </CardContent>
            <Drawer
                anchor={'bottom'}
                open={openDetail}
                sx={{ '.MuiCard-root': { overflow: 'auto' } }}
                PaperProps={{
                    sx: {
                        height: '100%',
                        width: '100%',
                        maxWidth: 'sm',
                        m: '0 auto'
                    }
                }}
                onClose={() => setOpenDetail(false)}
                keepMounted>
                <ProductDetailPage
                    data={data}
                    open={openDetail}
                    setOpen={setOpenDetail}
                />
            </Drawer>
        </Card>
    );
};

export default ProductItem;
