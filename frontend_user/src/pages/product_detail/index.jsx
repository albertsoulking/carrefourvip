import { ShareRounded } from '@mui/icons-material';
import { Box, Button, Chip, Skeleton, Typography } from '@mui/material';
import ProductItem from '../product/ProductItem';
import AddToCartBar from './AddToCartBar';
import { useEffect, useRef, useState } from 'react';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import web from '../../routes/web';
import ModalViewImage from './ModalViewImage';
import api from '../../routes/api';
import TopNavigator from '../layout/TopNavigator';
import { useParams } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';

const ProductDetailPage = ({ data, open, setOpen }) => {
    const { id } = useParams();
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useSmartNavigate();
    const scrollRef = useRef(null);
    // const [showLeft, setShowLeft] = useState(true);
    // const [showRight, setShowRight] = useState(true);
    const [product, setProduct] = useState(null);
    const [openImage, setOpenImage] = useState({
        open: false,
        data: null
    });
    const [imageList, setImageList] = useState([]);
    const [cover, setCover] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!open) return;
        if (!data?.id) return;

        loadData(data?.id);
    }, [open]);

    useEffect(() => {
        if (!id) return;

        loadData(id);
    }, [id]);

    const loadData = async (productId) => {
        try {
            const res = await api.products.get({
                id: productId,
                userId: user?.id
            });

            setProduct((prev) => {
                if (!prev || prev.id !== res.data.id) {
                    return res.data;
                }
                return prev;
            });
            setImageList(
                [
                    res.data.imageUrl,
                    ...(res.data.imageList ? res.data.imageList.split(',') : [])
                ].filter(Boolean)
            );
            setCover(res.data.imageUrl);
            setLoading(false);
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

    // const handleScroll = () => {
    //     const scrollElement = scrollRef.current;
    //     if (!scrollElement) return;

    //     const isAtStart = scrollElement.scrollLeft <= 16;
    //     const isAtEnd =
    //         scrollElement.scrollLeft + scrollElement.clientWidth >=
    //         scrollElement.scrollWidth - 1;

    //     setShowLeft(!isAtStart);
    //     setShowRight(!isAtEnd);
    // };

    // const handleScrollLeft = () => {
    //     if (scrollRef.current) {
    //         scrollRef.current.scrollLeft -= 1000;
    //         setTimeout(handleScroll, 100); // 等待 DOM 更新后检查
    //     }
    // };

    // const handleScrollRight = () => {
    //     if (scrollRef.current) {
    //         scrollRef.current.scrollLeft += 1000;
    //         setTimeout(handleScroll, 100); // 等待 DOM 更新后检查
    //     }
    // };

    return (
        <Box
            sx={{
                pt: 'var(--app-top-bar-space)',
                pb: 'var(--app-fixed-action-space)',
                minHeight: '100vh',
                bgcolor: 'var(--brand-cream)'
            }}>
            <TopNavigator
                backPath={id ? web.products : -1}
                setOpen={setOpen}
                backText={'Back'}
                title={'Product Detail'}
                btn={
                    <Button
                        size={'small'}
                        startIcon={<ShareRounded fontSize={'small'} />}
                        sx={{ textTransform: 'capitalize', p: 0, fontSize: 16 }}
                        onClick={() => {
                            navigator.clipboard.writeText(
                                location.origin + web.productDetail(product?.id)
                            );
                            enqueueSnackbar('Product sharing link copied', {
                                variant: 'success'
                            });
                        }}>
                        Share
                    </Button>
                }
            />
            {loading ? (
                <Box sx={{ px: 2, mb: 4 }}>
                    <Skeleton height={50} />
                    <Skeleton
                        height={50}
                        width={150}
                    />
                    <Skeleton
                        height={600}
                        sx={{ mt: -15 }}
                    />
                    <Box
                        display={'flex'}
                        sx={{ mt: -15 }}>
                        <Skeleton
                            height={140}
                            width={80}
                        />
                        <Skeleton
                            height={140}
                            width={80}
                            sx={{ mx: 2 }}
                        />
                        <Skeleton
                            height={140}
                            width={80}
                        />
                    </Box>
                    <Skeleton
                        height={50}
                        width={100}
                        sx={{ mt: -2 }}
                    />
                    <Skeleton
                        height={200}
                        sx={{ mt: -5 }}
                    />
                    <Box
                        display={'flex'}
                        sx={{ mt: -10 }}>
                        <Skeleton
                            height={300}
                            width={150}
                        />
                        <Skeleton
                            height={300}
                            width={150}
                            sx={{ mx: 2 }}
                        />
                        <Skeleton
                            height={300}
                            width={60}
                        />
                    </Box>
                </Box>
            ) : (
                <Box sx={{ pb: 2 }}>
                    <Box
                        sx={{
                            mx: 2,
                            mb: 2,
                            p: 2,
                            bgcolor: 'var(--brand-paper)',
                            border: '1px solid var(--brand-line)',
                            borderRadius: 'var(--brand-radius-lg)',
                            boxShadow: 'var(--brand-shadow)'
                        }}>
                        <Typography
                            variant={'h5'}
                            fontWeight={'bold'}
                            sx={{
                                userSelect: 'text',
                                color: 'var(--brand-ink)',
                                fontFamily: 'var(--font-display)'
                            }}>
                            {product?.name}
                        </Typography>

                        <Chip
                            label={product?.category?.name}
                            size={'small'}
                            sx={{ mt: 2 }}
                            onClick={() => {
                                const params = new URLSearchParams({
                                    category: product?.category?.id
                                });

                                navigate(web.products + '?' + params);
                            }}
                        />
                    </Box>
                    <Box
                        sx={{
                            mx: 2,
                            overflow: 'hidden',
                            borderRadius: 'var(--brand-radius-lg)',
                            bgcolor: 'var(--brand-paper)',
                            border: '1px solid var(--brand-line)'
                        }}>
                        <img
                            src={`${
                                import.meta.env.VITE_API_BASE_URL
                            }/uploads/images/${cover}`}
                            alt={product?.name}
                            style={{
                                width: '100%',
                                maxHeight: 420,
                                objectFit: 'contain',
                                cursor: 'zoom-in',
                                padding: 8,
                                display: 'block'
                            }}
                            onClick={() =>
                                setOpenImage({
                                    open: true,
                                    data: cover
                                })
                            }
                        />
                    </Box>
                    {imageList.length > 0 && (
                        <Box
                            display={'flex'}
                            mx={2}
                            mt={1}
                            gap={1}
                            overflow={'auto'}
                            sx={{ pb: 0.5 }}>
                            {imageList.map((img, index) => (
                                <Box
                                    key={index}
                                    component={'img'}
                                    src={`${
                                        import.meta.env.VITE_API_BASE_URL
                                    }/uploads/thumbs/${img}`}
                                    width={80}
                                    height={80}
                                    border={
                                        cover === img
                                            ? '2px solid var(--brand-forest)'
                                            : '1px solid var(--brand-line)'
                                    }
                                    borderRadius={'var(--brand-radius-md)'}
                                    sx={{
                                        objectFit: 'cover',
                                        cursor: 'pointer',
                                        bgcolor: 'var(--brand-paper)'
                                    }}
                                    onClick={() => setCover(img)}
                                />
                            ))}
                        </Box>
                    )}
                    <Box
                        px={2}
                        my={2}>
                        <Typography
                            variant={'body1'}
                            fontWeight={'bold'}
                            sx={{ my: 2 }}>
                            Description
                        </Typography>
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: 'var(--brand-paper)',
                                border: '1px solid var(--brand-line)',
                                borderRadius: 'var(--brand-radius-lg)',
                                color: 'var(--brand-ink)',
                                userSelect: 'text',
                                whiteSpace: 'pre-wrap',
                                '& img': {
                                    maxWidth: '100%',
                                    height: 'auto'
                                }
                            }}
                            dangerouslySetInnerHTML={{
                                __html: product?.description || ''
                            }}
                        />
                    </Box>

                    {!id && (
                        <Box
                            position={'relative'}
                            display={'flex'}
                            overflow={'hidden'}
                            sx={{ mt: 4, mb: 10 }}>
                            <Typography
                                sx={{
                                    position: 'absolute',
                                    top: -28,
                                    left: 16,
                                    fontWeight: 800,
                                    color: 'var(--brand-ink)'
                                }}>
                                Recommended products
                            </Typography>
                            <Box
                                ref={scrollRef}
                                // onScroll={handleScroll}
                                sx={{
                                    display: 'flex',
                                    overflow: 'auto',
                                    scrollSnapType: 'x mandatory',
                                    scrollBehavior: 'smooth',
                                    whiteSpace: 'nowrap',
                                    gap: 2,
                                    px: 2,
                                    transition: '0.6s ease'
                                }}>
                                {product?.similarProducts?.map((product) => (
                                        <Box
                                            key={product.id}
                                            size={{ xs: 6 }}
                                            sx={{
                                                flex: '0 0 auto',
                                                width: 180,
                                                scrollSnapAlign: 'start'
                                            }}
                                            onClick={() => setOpen(false)}>
                                            <ProductItem
                                                data={product}
                                                doubleRow={true}
                                            />
                                        </Box>
                                    ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            )}
            {!loading && (
                <AddToCartBar
                    data={product}
                />
            )}
            <ModalViewImage
                open={openImage.open}
                image={openImage.data}
                setOpen={setOpenImage}
            />
        </Box>
    );
};

export default ProductDetailPage;
