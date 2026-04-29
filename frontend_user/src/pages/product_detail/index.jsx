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
                res.data.imageList
                    ? [res.data.imageUrl, ...res.data.imageList.split(',')]
                    : [res.data.imageUrl]
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
                            enqueueSnackbar('ProdProduct sharing link copied', {
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
                    <Box sx={{ px: 2, mb: 2 }}>
                        <Typography
                            variant={'h5'}
                            fontWeight={'bold'}
                            sx={{ userSelect: 'text' }}>
                            {product?.name}
                        </Typography>

                        <Chip
                            label={product?.category.name}
                            size={'small'}
                            sx={{ mt: 2 }}
                            onClick={() => {
                                const params = new URLSearchParams({
                                    c: product.category?.id
                                });

                                navigate(web.products + '?' + params);
                            }}
                        />
                    </Box>
                    <img
                        src={`${
                            import.meta.env.VITE_API_BASE_URL
                        }/uploads/images/${cover}`}
                        alt={product?.name}
                        style={{
                            width: '100%',
                            objectFit: 'contain',
                            cursor: 'pointer',
                            padding: 8
                        }}
                        onClick={() =>
                            setOpenImage({
                                open: true,
                                data: product?.imageUrl
                            })
                        }
                    />
                    {imageList.length > 0 && (
                        <Box
                            display={'flex'}
                            mx={2}
                            gap={1}
                            overflow={'overlay'}>
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
                                            ? '1px solid #1976d2'
                                            : '1px solid #0000001a'
                                    }
                                    borderRadius={2}
                                    sx={{
                                        objectFit: 'cover',
                                        cursor: 'pointer'
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
                        <div
                            style={{
                                marginLeft: 20,
                                marginRight: 20,
                                marginBottom: 50,
                                userSelect: 'text',
                                whiteSpace: 'pre-wrap'
                            }}
                            dangerouslySetInnerHTML={{
                                __html: product?.description
                            }}
                        />
                    </Box>

                    {!id && (
                        <Box
                            position={'relative'}
                            display={'flex'}
                            overflow={'hidden'}
                            sx={{ mt: 4, mb: 10 }}>
                            <Box
                                ref={scrollRef}
                                // onScroll={handleScroll}
                                sx={{
                                    display: 'flex',
                                    overflow: 'overlay',
                                    scrollSnapType: 'x mandatory',
                                    scrollBehavior: 'smooth',
                                    whiteSpace: 'nowrap',
                                    gap: 2,
                                    px: 2,
                                    transition: '0.6s ease'
                                }}>
                                {product &&
                                    product.similarProducts.map((product) => (
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
