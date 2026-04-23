import { useEffect, useState } from 'react';
import {
    ArrowForwardRounded,
    LocalShippingRounded,
    LockRounded,
    SearchRounded,
    ShoppingBagRounded,
    ShoppingCartRounded,
    SupportAgentRounded,
    WorkspacePremiumRounded
} from '@mui/icons-material';
import {
    Badge,
    Box,
    Button,
    Chip,
    IconButton,
    InputBase,
    Skeleton,
    Stack,
    Typography
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import DrawerCartList from '../../components/DrawerCartList';
import assets from '../../assets';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import useNotificationSocket from '../../hooks/userNotificationSocket';
import api from '../../routes/api';
import web from '../../routes/web';
import ProductItem from '../product/ProductItem';
import BottomNavigator from '../layout/BottomNavigator';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

const BRAND_NAME = 'Zenviquea';
const BRAND_NOTE = 'Curated everyday market';

const fallbackSlides = [assets.city, assets.food_car, assets.b11];
const fallbackPromoImages = [assets.food_car, assets.discount_5, assets.city];

const serviceItems = [
    {
        icon: <LocalShippingRounded />,
        title: 'Fast dispatch',
        description: 'Hot picks and essentials are arranged to move quickly.'
    },
    {
        icon: <WorkspacePremiumRounded />,
        title: 'Curated shelves',
        description: 'The homepage is shaped like a store, not a random banner wall.'
    },
    {
        icon: <LockRounded />,
        title: 'Safer checkout',
        description: 'Cart access stays close and payment routes remain unchanged.'
    },
    {
        icon: <SupportAgentRounded />,
        title: 'Human-feel support',
        description: 'Clear product paths make browsing lighter for new shoppers.'
    }
];

const getUploadUrl = (folder, fileName) =>
    fileName
        ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${folder}/${fileName}`
        : '';

const SectionHeading = ({
    eyebrow,
    title,
    description,
    actionLabel,
    onAction
}) => (
    <Stack
        direction={'row'}
        justifyContent={'space-between'}
        alignItems={'flex-end'}
        gap={2}
        sx={{ px: 2, mt: 4, mb: 2 }}>
        <Box sx={{ minWidth: 0 }}>
            <Typography
                sx={{
                    color: 'var(--brand-forest)',
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase'
                }}>
                {eyebrow}
            </Typography>
            <Typography
                sx={{
                    mt: 0.75,
                    color: 'var(--brand-ink)',
                    fontSize: { xs: 24, sm: 28 },
                    fontWeight: 700,
                    lineHeight: 1.1,
                    fontFamily: 'var(--font-display)'
                }}>
                {title}
            </Typography>
            {description ? (
                <Typography
                    sx={{
                        mt: 1,
                        maxWidth: 520,
                        color: 'var(--brand-muted)',
                        fontSize: 14,
                        lineHeight: 1.65
                    }}>
                    {description}
                </Typography>
            ) : null}
        </Box>
        {actionLabel ? (
            <Button
                endIcon={<ArrowForwardRounded />}
                sx={{
                    color: 'var(--brand-forest)',
                    fontWeight: 700,
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                }}
                onClick={onAction}>
                {actionLabel}
            </Button>
        ) : null}
    </Stack>
);

const PromoPanel = ({ title, description, image, actionLabel, onClick }) => (
    <Box
        sx={{
            minWidth: 260,
            flex: '1 0 260px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '24px',
            p: 2.5,
            color: '#fff',
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            backgroundImage: `linear-gradient(135deg, rgba(13, 27, 23, 0.82), rgba(25, 76, 59, 0.3)), url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 18px 40px rgba(23, 57, 44, 0.16)'
        }}
        onClick={onClick}>
        <Typography
            sx={{
                maxWidth: 220,
                fontSize: 22,
                fontWeight: 700,
                lineHeight: 1.15,
                fontFamily: 'var(--font-display)'
            }}>
            {title}
        </Typography>
        <Typography
            sx={{
                mt: 1.25,
                maxWidth: 240,
                fontSize: 13,
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.85)'
            }}>
            {description}
        </Typography>
        <Button
            endIcon={<ArrowForwardRounded />}
            variant={'contained'}
            sx={{
                mt: 2.5,
                px: 2,
                py: 0.9,
                bgcolor: '#fff',
                color: 'var(--brand-forest)',
                borderRadius: '999px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                    bgcolor: '#fff',
                    boxShadow: 'none'
                }
            }}>
            {actionLabel}
        </Button>
    </Box>
);

const CategoryTile = ({ item, onClick }) => {
    const categoryImage = item?.imageUrl
        ? getUploadUrl('thumbs', item.imageUrl)
        : '';

    return (
        <Box
            sx={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 120,
                p: 1.5,
                borderRadius: '22px',
                cursor: 'pointer',
                color: categoryImage ? '#fff' : 'var(--brand-ink)',
                border: categoryImage
                    ? '1px solid rgba(255, 255, 255, 0.12)'
                    : '1px solid rgba(23, 57, 44, 0.1)',
                background: categoryImage
                    ? `linear-gradient(180deg, rgba(8, 16, 14, 0.05), rgba(8, 16, 14, 0.72)), url(${categoryImage})`
                    : 'linear-gradient(145deg, #fff8eb, #ecefe7)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 14px 32px rgba(23, 57, 44, 0.08)'
            }}
            onClick={onClick}>
            <Chip
                label={'Shop now'}
                size={'small'}
                sx={{
                    bgcolor: categoryImage
                        ? 'rgba(255, 255, 255, 0.14)'
                        : 'rgba(23, 57, 44, 0.08)',
                    color: categoryImage ? '#fff' : 'var(--brand-forest)',
                    fontWeight: 700
                }}
            />
            <Typography
                sx={{
                    mt: 3.5,
                    fontSize: 19,
                    fontWeight: 700,
                    lineHeight: 1.15,
                    fontFamily: 'var(--font-display)'
                }}>
                {item?.name}
            </Typography>
        </Box>
    );
};

const ProductGridSkeleton = ({ count = 4 }) => (
    <Box
        sx={{
            px: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 1.5
        }}>
        {Array.from({ length: count }).map((_, index) => (
            <Box
                key={index}
                sx={{
                    overflow: 'hidden',
                    borderRadius: '22px',
                    border: '1px solid rgba(23, 57, 44, 0.08)',
                    bgcolor: '#fff'
                }}>
                <Skeleton
                    variant={'rectangular'}
                    height={180}
                />
                <Box sx={{ p: 1.5 }}>
                    <Skeleton height={28} />
                    <Skeleton
                        height={24}
                        width={'55%'}
                    />
                    <Skeleton
                        height={30}
                        width={'42%'}
                    />
                </Box>
            </Box>
        ))}
    </Box>
);

const HomePage = () => {
    const navigate = useSmartNavigate();
    const [searchParams] = useSearchParams();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [searchValue, setSearchValue] = useState('');
    const [heroIndex, setHeroIndex] = useState(0);
    const [openCart, setOpenCart] = useState(false);
    const [loading, setLoading] = useState(true);
    const [headerStatus, setHeaderStatus] = useState({
        totalUnread: 0,
        totalFavorite: 0,
        totalCart: 0,
        totalUnpaid: 0
    });
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [editorPicks, setEditorPicks] = useState([]);

    const referralCode = searchParams.get('ref');
    const heroSlides = banners.length > 0 ? banners : fallbackSlides;
    const spotlightProduct = newArrivals[0] || editorPicks[0] || null;
    const highlightCategories = categories.slice(0, 4);
    const promoPanels = [
        {
            title: 'Tonight’s basket reset',
            description:
                'Build a full cart quickly with shelf-ready staples, household finds, and low-friction checkout.',
            image:
                banners[1] ||
                fallbackPromoImages[0],
            actionLabel: 'Browse essentials',
            onClick: () => navigate(web.products)
        },
        {
            title: 'Small gifts, better taste',
            description:
                'Pick up thoughtful items that feel chosen instead of generic, even on a fast order.',
            image:
                banners[2] ||
                fallbackPromoImages[1],
            actionLabel: 'See curated picks',
            onClick: () => navigate(web.products)
        }
    ];

    useNotificationSocket((notification) => {
        if (notification.type !== 'cart') return;

        loadHeaderStatus();
    });

    useEffect(() => {
        const storedCode = localStorage.getItem('code');

        if (referralCode && referralCode !== storedCode) {
            localStorage.setItem('code', referralCode);
        }

        setSearchValue(searchParams.get('q') || '');
        loadHeaderStatus();
        loadHomeData();
    }, []);

    useEffect(() => {
        if (heroIndex < heroSlides.length) return;

        setHeroIndex(0);
    }, [heroIndex, heroSlides.length]);

    useEffect(() => {
        if (heroSlides.length < 2) return undefined;

        const timer = window.setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroSlides.length);
        }, 4500);

        return () => window.clearInterval(timer);
    }, [heroSlides.length]);

    const loadHeaderStatus = async () => {
        if (!user) return;

        try {
            const res = await api.header.getStatus();
            setHeaderStatus(res.data);
        } catch (error) {
            console.error('Failed to load header status:', error);
        }
    };

    const loadHomeData = async () => {
        setLoading(true);

        try {
            const productPayload = user?.id
                ? { userId: user.id.toString() }
                : {};

            const [settingsRes, categoriesRes, latestRes, picksRes] =
                await Promise.all([
                    api.settings.get({
                        key: 'website',
                        group: 'setting'
                    }),
                    api.categories.getAll({
                        isActive: 1,
                        page: 1,
                        limit: 6,
                        orderBy: 'asc',
                        sortBy: 'displayOrder'
                    }),
                    api.products.getAll({
                        ...productPayload,
                        page: 1,
                        limit: 6,
                        orderBy: 'desc',
                        sortBy: 'id'
                    }),
                    api.products.getAll({
                        ...productPayload,
                        page: 1,
                        limit: 8,
                        orderBy: 'asc',
                        sortBy: 'name',
                        isRandom: 1
                    })
                ]);

            const websiteData = settingsRes.data || {};
            const normalizedBanners = websiteData?.homepageBanner
                ? websiteData.homepageBanner
                      .split(',')
                      .filter(Boolean)
                      .map((item) => getUploadUrl('images', item))
                : [];

            setBanners(normalizedBanners);
            setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
            setNewArrivals(latestRes.data?.data || []);
            setEditorPicks(picksRes.data?.data || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const keyword = searchValue.trim();
        const params = new URLSearchParams({
            q: keyword,
            category: 0
        });

        navigate(`${web.products}?${params.toString()}`);
    };

    const handleCategoryClick = (categoryId) => {
        const params = new URLSearchParams({
            category: categoryId
        });

        navigate(`${web.products}?${params.toString()}`);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                pb: 10,
                bgcolor: 'var(--brand-cream)'
            }}>
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    px: 2,
                    pt: 1.5,
                    pb: 1.75,
                    backdropFilter: 'blur(18px)',
                    bgcolor: 'rgba(247, 242, 232, 0.82)',
                    borderBottom: '1px solid rgba(23, 57, 44, 0.08)'
                }}>
                <Stack
                    direction={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    gap={2}>
                    <Stack
                        direction={'row'}
                        alignItems={'center'}
                        gap={1.25}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(web.home)}>
                        <Box
                            sx={{
                                width: 46,
                                height: 46,
                                display: 'grid',
                                placeItems: 'center',
                                borderRadius: '16px',
                                bgcolor: 'var(--brand-forest)',
                                color: '#fff',
                                boxShadow: '0 12px 24px rgba(23, 57, 44, 0.22)'
                            }}>
                            <ShoppingBagRounded fontSize={'small'} />
                        </Box>
                        <Box>
                            <Typography
                                translate={'no'}
                                sx={{
                                    color: 'var(--brand-ink)',
                                    fontSize: 23,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    fontFamily: 'var(--font-display)'
                                }}>
                                {BRAND_NAME}
                            </Typography>
                            <Typography
                                sx={{
                                    mt: 0.25,
                                    color: 'var(--brand-muted)',
                                    fontSize: 12
                                }}>
                                {BRAND_NOTE}
                            </Typography>
                        </Box>
                    </Stack>

                    <IconButton
                        sx={{
                            width: 46,
                            height: 46,
                            bgcolor: '#fff',
                            border: '1px solid rgba(23, 57, 44, 0.08)',
                            boxShadow: '0 10px 18px rgba(23, 57, 44, 0.08)'
                        }}
                        onClick={() => setOpenCart(true)}>
                        <Badge
                            badgeContent={Number(headerStatus.totalCart)}
                            color={'error'}>
                            <ShoppingCartRounded sx={{ color: 'var(--brand-forest)' }} />
                        </Badge>
                    </IconButton>
                </Stack>

                <Box
                    sx={{
                        mt: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 0.75,
                        pl: 1.5,
                        borderRadius: '20px',
                        bgcolor: '#fffdfa',
                        border: '1px solid rgba(23, 57, 44, 0.08)',
                        boxShadow: '0 14px 30px rgba(23, 57, 44, 0.08)'
                    }}>
                    <SearchRounded sx={{ color: 'var(--brand-muted)' }} />
                    <InputBase
                        value={searchValue}
                        placeholder={'Search products, gifts, pantry picks...'}
                        sx={{
                            flex: 1,
                            color: 'var(--brand-ink)',
                            fontSize: 14
                        }}
                        onChange={(event) => setSearchValue(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                    />
                    <Button
                        variant={'contained'}
                        sx={{
                            px: 2,
                            py: 1,
                            minWidth: 0,
                            borderRadius: '14px',
                            bgcolor: 'var(--brand-forest)',
                            color: '#fff',
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: 'var(--brand-forest)',
                                boxShadow: 'none'
                            }
                        }}
                        onClick={handleSearch}>
                        Search
                    </Button>
                </Box>
            </Box>

            <Box sx={{ px: 2, pt: 2 }}>
                <Box
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: 300,
                        p: 2.5,
                        borderRadius: '30px',
                        color: '#fff',
                        backgroundImage: `linear-gradient(180deg, rgba(9, 15, 14, 0.18), rgba(9, 15, 14, 0.72)), url(${heroSlides[heroIndex]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        boxShadow: '0 28px 55px rgba(23, 57, 44, 0.18)'
                    }}>
                    <Chip
                        label={'Storefront refresh'}
                        sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.14)',
                            color: '#fff',
                            fontWeight: 700,
                            backdropFilter: 'blur(6px)'
                        }}
                    />

                    <Typography
                        sx={{
                            mt: 2.5,
                            fontSize: { xs: 34, sm: 40 },
                            lineHeight: 1.02,
                            fontWeight: 700,
                            fontFamily: 'var(--font-display)'
                        }}>
                        Welcome to {BRAND_NAME}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 1.5,
                            fontSize: 14,
                            lineHeight: 1.8,
                            color: 'rgba(255, 255, 255, 0.9)'
                        }}>
                        {BRAND_NAME} mixes fast essentials, curated surprises, and
                        cleaner browsing paths so shoppers can go from landing to
                        cart without getting lost.
                    </Typography>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        gap={1.2}
                        sx={{ mt: 6 }}>
                        <Button
                            endIcon={<ArrowForwardRounded />}
                            variant={'contained'}
                            sx={{
                                py: 1.2,
                                borderRadius: '999px',
                                bgcolor: '#fff',
                                color: 'var(--brand-forest)',
                                fontWeight: 700,
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: '#fff',
                                    boxShadow: 'none'
                                }
                            }}
                            onClick={() => navigate(web.products)}>
                            Shop all products
                        </Button>
                        <Button
                            variant={'outlined'}
                            sx={{
                                py: 1.2,
                                borderRadius: '999px',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                color: '#fff',
                                fontWeight: 700,
                                textTransform: 'none'
                            }}
                            onClick={() => {
                                if (!highlightCategories[0]) {
                                    navigate(web.products);
                                    return;
                                }

                                handleCategoryClick(highlightCategories[0].id);
                            }}>
                            Enter a category
                        </Button>
                    </Stack>

                    <Stack
                        direction={'row'}
                        gap={1}
                        flexWrap={'wrap'}
                        sx={{ mt: 2 }}>
                        {highlightCategories.map((item) => (
                            <Chip
                                key={item.id}
                                label={item.name}
                                sx={{
                                    color: '#fff',
                                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                                    borderRadius: '999px',
                                    backdropFilter: 'blur(6px)'
                                }}
                                onClick={() => handleCategoryClick(item.id)}
                            />
                        ))}
                    </Stack>

                    {spotlightProduct ? (
                        <Box
                            sx={{
                                position: 'absolute',
                                right: 18,
                                bottom: 18,
                                left: 18,
                                p: 2,
                                borderRadius: '22px',
                                cursor: 'pointer',
                                border: '1px solid rgba(255, 255, 255, 0.18)',
                                bgcolor: 'rgba(12, 20, 18, 0.4)',
                                backdropFilter: 'blur(16px)'
                            }}
                            onClick={() =>
                                navigate(
                                    web.productDetail(spotlightProduct.id)
                                )
                            }>
                            <Typography
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: 11,
                                    letterSpacing: '0.14em',
                                    textTransform: 'uppercase'
                                }}>
                                Spotlight pick
                            </Typography>
                            <Typography
                                sx={{
                                    mt: 0.75,
                                    fontSize: 18,
                                    fontWeight: 700,
                                    lineHeight: 1.2
                                }}>
                                {spotlightProduct.name}
                            </Typography>
                            <Stack
                                direction={'row'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                                gap={2}
                                sx={{ mt: 1.25 }}>
                                <Typography
                                    component={'div'}
                                    sx={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        color: '#fff'
                                    }}>
                                    {useStyledLocaleString(
                                        spotlightProduct.price,
                                        user?.geoInfo
                                    )}
                                </Typography>
                                <Chip
                                    label={
                                        spotlightProduct.category?.name ||
                                        'Featured'
                                    }
                                    size={'small'}
                                    sx={{
                                        color: '#fff',
                                        bgcolor: 'rgba(255, 255, 255, 0.12)'
                                    }}
                                />
                            </Stack>
                        </Box>
                    ) : null}
                </Box>

                <Stack
                    direction={'row'}
                    justifyContent={'center'}
                    gap={1}
                    sx={{ mt: 1.5 }}>
                    {heroSlides.map((_, index) => (
                        <Box
                            key={index}
                            sx={{
                                width: index === heroIndex ? 26 : 8,
                                height: 8,
                                borderRadius: '999px',
                                bgcolor:
                                    index === heroIndex
                                        ? 'var(--brand-forest)'
                                        : 'rgba(23, 57, 44, 0.2)',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </Stack>
            </Box>

            <SectionHeading
                eyebrow={'Shop by lane'}
                title={'Category shortcuts that actually sell'}
                description={
                    'The old mixed banner flow is gone. These entries push shoppers directly into product shelves.'
                }
            />

            <Box
                sx={{
                    px: 2,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 1.5
                }}>
                {loading && categories.length === 0
                    ? Array.from({ length: 4 }).map((_, index) => (
                          <Skeleton
                              key={index}
                              variant={'rectangular'}
                              height={120}
                              sx={{ borderRadius: '22px' }}
                          />
                      ))
                    : categories.map((item) => (
                          <CategoryTile
                              key={item.id}
                              item={item}
                              onClick={() => handleCategoryClick(item.id)}
                          />
                      ))}
            </Box>

            <Box
                sx={{
                    mt: 4,
                    px: 2,
                    display: 'flex',
                    gap: 1.5,
                    overflowX: 'auto',
                    pb: 1
                }}>
                {promoPanels.map((panel, index) => (
                    <PromoPanel
                        key={index}
                        {...panel}
                    />
                ))}
            </Box>

            <SectionHeading
                eyebrow={'Fresh drop'}
                title={'New arrivals with fast cart energy'}
                description={
                    'A tighter product grid keeps the homepage feeling like an active market instead of a brochure.'
                }
                actionLabel={'View all'}
                onAction={() => navigate(web.products)}
            />

            {loading && newArrivals.length === 0 ? (
                <ProductGridSkeleton />
            ) : (
                <Box
                    sx={{
                        px: 2,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: 1.5
                    }}>
                    {newArrivals.slice(0, 4).map((product) => (
                        <ProductItem
                            key={product.id}
                            data={product}
                            doubleRow={true}
                        />
                    ))}
                </Box>
            )}

            <SectionHeading
                eyebrow={'Editor list'}
                title={'Curated picks for quick basket building'}
                description={
                    'These products are intentionally mixed so the page feels broader, more shoppable, and less repetitive.'
                }
                actionLabel={'See more'}
                onAction={() => navigate(web.products)}
            />

            {loading && editorPicks.length === 0 ? (
                <ProductGridSkeleton count={6} />
            ) : (
                <Box
                    sx={{
                        px: 2,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: 1.5
                    }}>
                    {editorPicks.slice(0, 6).map((product) => (
                        <ProductItem
                            key={product.id}
                            data={product}
                            doubleRow={true}
                        />
                    ))}
                </Box>
            )}

            <SectionHeading
                eyebrow={'Why it works'}
                title={'Utility blocks that support conversion'}
                description={
                    'This area gives the home page the trust and service signals shoppers expect from a commerce app.'
                }
            />

            <Box
                sx={{
                    px: 2,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 1.5
                }}>
                {serviceItems.map((item) => (
                    <Box
                        key={item.title}
                        sx={{
                            p: 2,
                            borderRadius: '22px',
                            bgcolor: '#fffdfa',
                            border: '1px solid rgba(23, 57, 44, 0.08)',
                            boxShadow: '0 14px 28px rgba(23, 57, 44, 0.06)'
                        }}>
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                display: 'grid',
                                placeItems: 'center',
                                borderRadius: '14px',
                                bgcolor: 'rgba(23, 57, 44, 0.08)',
                                color: 'var(--brand-forest)'
                            }}>
                            {item.icon}
                        </Box>
                        <Typography
                            sx={{
                                mt: 2,
                                color: 'var(--brand-ink)',
                                fontSize: 17,
                                fontWeight: 700
                            }}>
                            {item.title}
                        </Typography>
                        <Typography
                            sx={{
                                mt: 0.75,
                                color: 'var(--brand-muted)',
                                fontSize: 13,
                                lineHeight: 1.65
                            }}>
                            {item.description}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <Box
                sx={{
                    mx: 2,
                    mt: 4,
                    p: 2.5,
                    borderRadius: '28px',
                    color: '#fff',
                    background:
                        'linear-gradient(135deg, #17392c 0%, #244b3b 52%, #b8892d 100%)',
                    boxShadow: '0 24px 48px rgba(23, 57, 44, 0.18)'
                }}>
                <Typography
                    sx={{
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'rgba(255, 255, 255, 0.68)'
                    }}>
                    Final pass
                </Typography>
                <Typography
                    sx={{
                        mt: 1,
                        fontSize: 29,
                        lineHeight: 1.1,
                        fontWeight: 700,
                        fontFamily: 'var(--font-display)'
                    }}>
                    {BRAND_NAME} now reads like a commerce brand, not the old
                    campaign page.
                </Typography>
                <Typography
                    sx={{
                        mt: 1.5,
                        fontSize: 14,
                        lineHeight: 1.8,
                        color: 'rgba(255, 255, 255, 0.86)'
                    }}>
                    I picked a self-created name and checked quoted web searches
                    for it. I did not see obvious indexed exact-match results, but
                    that still is not a trademark or domain guarantee.
                </Typography>
            </Box>

            <DrawerCartList
                open={openCart}
                setOpen={setOpenCart}
            />
            <BottomNavigator />
        </Box>
    );
};

export default HomePage;
