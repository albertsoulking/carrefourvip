import { useEffect, useState, useRef, useCallback } from 'react';
import {
    Grid,
    Box,
    CircularProgress,
    Button,
    Tabs,
    Tab,
    Skeleton
} from '@mui/material';
import api from '../../routes/api';
import { useSearchParams } from 'react-router-dom';
import usePageState from '../../hooks/usePageState';
import ProductItem from './ProductItem';
import CategoryHeader from './CategoryHeader';
import CategorySearchBar from '../layout/CategorySearchBar';
import BottomNavigator from '../layout/BottomNavigator';
import CategoryFilter from './CategoryFilter';
import { KeyboardArrowUpRounded } from '@mui/icons-material';

const InfiniteProductList = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const offsetRef = useRef(1);
    const loadingRef = useRef(false);
    const observerRef = useRef();
    const [searchModal, setSearchModal] = useState({
        page: 1,
        limit: 12,
        orderBy: 'asc',
        sortBy: 'name'
    });
    const [state, setState] = usePageState(searchModal);
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const [doubleRow, setdoubleRow] = useState(true);
    const [categoryData, setCategoryData] = useState(null);
    const [filter, setFilter] = useState({
        orderBy: null,
        sortBy: null
    });
    const [isScrolledTop, setIsScrolledTop] = useState(true);
    const [categories, setCategories] = useState([]);

    const loadMore = useCallback(
        async (data) => {
            if (loadingRef.current) return;

            const payload = { ...data, userId: user?.id.toString() };

            loadingRef.current = true;
            setLoading(true);
            setSearchModal(payload);
            setState(payload);

            // 等一帧渲染 spinner
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const res = await api.products.getAll(payload); // fetchProducts(offsetRef.current, 10);
            setProducts((prev) => [...prev, ...res.data.data]);
            offsetRef.current += 1;
            loadingRef.current = false;
            setLoading(false);
        },
        [searchParams]
    );

    // 监听分类、排序变化时重置
    useEffect(() => {
        setProducts([]); // 清空旧数据
        offsetRef.current = 1; // 重置游标
        loadMore({
            ...(state ? state : searchModal),
            page: offsetRef.current,
            limit: 20,
            query: query ?? null,
            categoryId: category ? Number(category) : null,
            orderBy: filter.orderBy ?? 'asc',
            sortBy: filter.sortBy ?? 'name'
        }); // 拉取第一页

        loadCategoryData();
    }, [category, filter.orderBy, searchParams]);

    // 初始化加载第一页
    useEffect(() => {
        loadMore({
            ...(state ? state : searchModal),
            page: offsetRef.current,
            limit: 20,
            query: query ?? null,
            categoryId: category ? Number(category) : null,
            orderBy: filter.orderBy ?? 'asc',
            sortBy: filter.sortBy ?? 'name'
        });
        loadCategoryData();
    }, []);

    useEffect(() => {
        loadAllCategoryData();
    }, []);

    const loadAllCategoryData = async () => {
        const payload = {
            isActive: 1,
            page: 1,
            limit: 100,
            orderBy: 'asc',
            sortBy: 'displayOrder'
        };

        const cates = await api.categories.getAll(payload);
        setCategories(cates.data);
    };

    const loadCategoryData = async () => {
        if (!category) return;

        const res = await api.categories.get({ id: Number(category) });
        setCategoryData(res.data);
    };

    // 监听最后一个商品
    const lastProductRef = useCallback(
        (node) => {
            if (!node) return;
            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    loadMore({
                        ...(state ? state : searchModal),
                        page: offsetRef.current,
                        limit: 20,
                        query: query ?? null,
                        categoryId: category ? Number(category) : null,
                        orderBy: filter.orderBy ?? 'asc',
                        sortBy: filter.sortBy ?? 'name'
                    });
                }
            });

            observerRef.current.observe(node);
        },
        [loadMore]
    );

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset;
            setIsScrolledTop(scrollTop < 50);
        };

        window.addEventListener('scroll', handleScroll);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleOnClick = (event) => {
        event.preventDefault();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleChange = (event, newValue) => {
        offsetRef.current = 1;
        setProducts([]);
        setSearchParams({
            category: newValue === 0 ? 0 : categories[newValue - 1].id
        });
        loadMore({
            ...(state ? state : searchModal),
            page: offsetRef.current,
            limit: 20,
            query: null,
            categoryId: newValue === 0 ? 0 : categories[newValue - 1].id,
            orderBy: filter.orderBy ?? 'asc',
            sortBy: filter.sortBy ?? 'name'
        });
    };

    return (
        <Box
            sx={{
                px: 2,
                pt: 8,
                pb: 11,
                minHeight: '100vh',
                bgcolor: 'var(--brand-cream)'
            }}>
            <CategorySearchBar />
            <Grid
                container
                spacing={1}>
                <Box sx={{ width: '100%' }}>
                    <Tabs
                        value={
                            categories.findIndex(
                                (c) => c.id === Number(category)
                            ) + 1
                        }
                        onChange={handleChange}
                        variant={'scrollable'}
                        scrollButtons='auto'
                        sx={{
                            minHeight: 'auto',
                            minWidth: 'auto',
                            mb: 1,
                            px: 0.5,
                            bgcolor: 'var(--brand-paper)',
                            border: '1px solid var(--brand-line)',
                            borderRadius: 'var(--brand-radius-md)',
                            boxShadow: 'var(--brand-shadow)'
                        }}
                        allowScrollButtonsMobile>
                        <Tab
                            label={'All'}
                            sx={{
                                minHeight: 'auto',
                                minWidth: 'auto',
                                overflow: 'auto',
                                textTransform: 'capitalize'
                            }}
                        />
                        {categories.map((tab, idx) => (
                            <Tab
                                key={idx}
                                label={tab.name}
                                sx={{
                                    minHeight: 'auto',
                                    minWidth: 'auto',
                                    overflow: 'auto',
                                    textTransform: 'capitalize'
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>
                <Grid size={{ xs: 12 }}>
                    <CategoryHeader data={categoryData} />
                    <CategoryFilter
                        filter={filter}
                        setFilter={setFilter}
                    />
                </Grid>
                {products.map((product, index) => {
                    const isLast = index === products.length - 1;
                    return (
                        <Grid
                            key={product.id}
                            size={{ xs: doubleRow ? 6 : 12 }}
                            sx={{
                                transition: '0.6s ease'
                            }}
                            ref={isLast ? lastProductRef : null}>
                            <ProductItem
                                data={product}
                                doubleRow={doubleRow}
                            />
                        </Grid>
                    );
                })}
                {loading && (
                    <>
                        <Grid
                            size={{ xs: 12 }}
                            sx={{ mt: 8 }}></Grid>
                        {Array.from({ length: 10 }).map((_, index) => (
                            <Grid
                                key={index}
                                size={{ xs: doubleRow ? 6 : 12 }}>
                                <Skeleton
                                    height={400}
                                    sx={{ mt: -20 }}
                                />
                            </Grid>
                        ))}
                    </>
                )}
            </Grid>
            <BottomNavigator />
            <Button
                variant={'contained'}
                sx={{
                    position: 'fixed',
                    right: 20,
                    bottom: isScrolledTop ? -50 : 80,
                    opacity: isScrolledTop ? 0 : 1,
                    visibility: isScrolledTop ? 'hidden' : 'visible',
                    zIndex: 5,
                    minWidth: 0,
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    p: 0,
                    bgcolor: 'var(--brand-forest)',
                    color: '#fff',
                    boxShadow: 'var(--brand-shadow)',
                    transition: '0.5s',
                    animation: 'scroll_top 5s linear infinite'
                }}
                onClick={handleOnClick}>
                <KeyboardArrowUpRounded fontSize={'large'} />
            </Button>
        </Box>
    );
};

export default InfiniteProductList;
