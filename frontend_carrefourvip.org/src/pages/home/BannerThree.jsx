import {
    Grid,
    Typography,
    Box,
    Button,
    Stack
} from '@mui/material';
import web from '../../routes/web';
import { useState, useRef, useEffect } from 'react';
import api from '../../routes/api';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

const BannerThree = () => {
    const itemsPerRow = 4;
    const rowsPerPage = 2;
    const itemsPerPage = itemsPerRow * rowsPerPage;
    const [categories, setCategories] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(0);
    const scrollRef = useRef(null);
    const navigate = useSmartNavigate();

    useEffect(() => {
        loadCategoryData();
    }, []);

    const loadCategoryData = async () => {
        const payload = {
            isActive: 1,
            page: 1,
            limit: 100,
            orderBy: 'asc',
            sortBy: 'displayOrder'
        };

        const cates = await api.categories.getAll(payload);
        setCategories(cates.data);
        setPageCount(Math.ceil(cates.data.length / itemsPerPage));
    };

    const goToPage = (pageIndex) => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth * pageIndex;
            scrollRef.current.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
            setPage(pageIndex);
        }
    };

    // 分页数据
    const pages = Array.from({ length: pageCount }, (_, pageIndex) =>
        categories.slice(
            pageIndex * itemsPerPage,
            (pageIndex + 1) * itemsPerPage
        )
    );

    const handleOnClick = (category) => {
        const params = new URLSearchParams({
            category
        });

        navigate(web.products + '?' + params);
    };

    return (
        <Box mx={2}>
            {/* 横向滑动容器 */}
            <Box
                ref={scrollRef}
                sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    '&::-webkit-scrollbar': { display: 'none' }
                }}>
                {pages.map((page, index) => (
                    <Box
                        key={index}
                        sx={{
                            flex: '0 0 100%',
                            scrollSnapAlign: 'start'
                        }}>
                        <Grid
                            container
                            spacing={2}>
                            {page.map((cat) => (
                                <Grid
                                    size={{ xs: 3 }}
                                    key={cat.id}
                                    onClick={() => console.log(cat.id)}>
                                    <Box
                                        component={'img'}
                                        src={`${
                                            import.meta.env.VITE_API_BASE_URL
                                        }/uploads/thumbs/${cat.imageUrl}`}
                                        alt={cat.name}
                                        sx={{
                                            m: '0 auto',
                                            bgcolor: 'grey.200',
                                            width: 60,
                                            height: 60,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 2,
                                            objectFit: 'cover',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleOnClick(cat.id)}
                                    />
                                    <Typography
                                        noWrap
                                        fontSize={12}
                                        textAlign={'center'}
                                        sx={{
                                            ':hover': {
                                                textDecoration: 'underline',
                                                cursor: 'pointer'
                                            }
                                        }}
                                        onClick={() => handleOnClick(cat.id)}>
                                        {cat.name}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))}
            </Box>

            {/* 分页指示器 */}
            {pageCount > 1 && (
                <Stack
                    direction={'row'}
                    justifyContent={'center'}
                    spacing={1}
                    mt={1}>
                    {Array.from({ length: pageCount }).map((_, i) => (
                        <Button
                            key={i}
                            onClick={() => goToPage(i)}
                            sx={{
                                minWidth: 10,
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor:
                                    i === page ? 'primary.main' : 'grey.400',
                                padding: 0
                            }}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default BannerThree;
