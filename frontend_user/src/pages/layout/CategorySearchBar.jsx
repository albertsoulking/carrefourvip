import {
    Container,
    Toolbar,
    IconButton,
    InputBase,
    Box,
    Badge,
    Paper,
    List,
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
    CircularProgress
} from '@mui/material';
import {
    ShoppingCartRounded,
    SearchRounded,
    MenuRounded,
    CancelRounded
} from '@mui/icons-material';
import DrawerMenuList from '../../components/DrawerMenuList';
import { useEffect, useRef, useState } from 'react';
import DrawerCartList from '../../components/DrawerCartList';
import api from '../../routes/api';
import { useSearchParams } from 'react-router-dom';
import web from '../../routes/web';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import useNotificationSocket from '../../hooks/userNotificationSocket';

const CategorySearchBar = () => {
    const navigate = useSmartNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [openMenu, setOpenMenu] = useState(false);
    const [openCart, setOpenCart] = useState(false);
    const [headerStatus, setHeaderStatus] = useState({
        totalUnread: 0,
        totalFavorite: 0,
        totalCart: 0,
        totalUnpaid: 0
    });
    const [value, setValue] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionCacheRef = useRef({});
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const category = searchParams.get('category');

    useNotificationSocket((noti) => {
        if (noti.type !== 'cart') return;

        loadHeaderStatus();
    });

    useEffect(() => {
        loadHeaderStatus();
        setValue(value ?? query ?? '');
    }, []);

    useEffect(() => {
        const keyword = (value ?? '').trim();

        if (keyword.length < 2) {
            setSuggestions([]);
            setSuggestLoading(false);
            return undefined;
        }

        if (suggestionCacheRef.current[keyword]) {
            setSuggestions(suggestionCacheRef.current[keyword]);
            return undefined;
        }

        const timer = window.setTimeout(async () => {
            setSuggestLoading(true);
            try {
                const res = await api.products.getAll({
                    page: 1,
                    limit: 6,
                    query: keyword,
                    categoryId:
                        category && Number(category) !== 0
                            ? Number(category)
                            : null,
                    orderBy: 'asc',
                    sortBy: 'name',
                    userId: user?.id?.toString()
                });
                const nextSuggestions = res.data?.data || [];
                suggestionCacheRef.current[keyword] = nextSuggestions;
                setSuggestions(nextSuggestions);
            } catch (error) {
                console.error('Failed to load search suggestions:', error);
                setSuggestions([]);
            } finally {
                setSuggestLoading(false);
            }
        }, 450);

        return () => window.clearTimeout(timer);
    }, [value, category]);

    const loadHeaderStatus = async () => {
        if (!user) return;

        const res = await api.header.getStatus();
        setHeaderStatus(res.data);
    };

    const handleOnSearchClick = () => {
        const payload = new URLSearchParams({
            q: value ?? query ?? '',
            category: category ? Number(category) : 0
        }).toString();

        setShowSuggestions(false);
        navigate(`${web.products}?${payload}`);
    };

    const handleOnClear = () => {
        setValue('');
        setSuggestions([]);
        setShowSuggestions(false);
        const payload = new URLSearchParams({
            q: '',
            category: category ? Number(category) : 0
        }).toString();

        navigate(`${web.products}?${payload}`);
    };

    return (
        <Container
            maxWidth={'sm'}
            sx={{
                position: 'fixed',
                zIndex: 999,
                top: 0,
                left: 0,
                right: 0,
                bgcolor: 'var(--brand-nav)',
                backdropFilter: 'blur(var(--brand-blur))',
                borderBottom: '1px solid var(--brand-line)',
                boxShadow: 'var(--brand-shadow)'
            }}
            disableGutters>
            <Toolbar>
                <IconButton
                    sx={{
                        width: 42,
                        height: 42,
                        bgcolor: 'var(--brand-paper)',
                        border: '1px solid var(--brand-line)'
                    }}
                    onClick={() => setOpenMenu(true)}>
                    <MenuRounded />
                </IconButton>
                {/* 搜索框 */}
                <Box
                    sx={{
                        position: 'relative',
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'var(--brand-paper)',
                        border: '1px solid var(--brand-line)',
                        borderRadius: 'var(--brand-radius-md)',
                        px: 1.5,
                        py: 0.25,
                        mx: 1,
                        boxShadow: 'var(--brand-shadow)'
                    }}>
                    <SearchRounded sx={{ color: 'var(--brand-muted)' }} />
                    <InputBase
                        value={value ?? ''}
                        placeholder={'Search for products'}
                        sx={{
                            ml: 1,
                            flex: 1,
                            color: 'var(--brand-ink)',
                            fontSize: 14
                        }}
                        onChange={(e) => setValue(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => {
                            window.setTimeout(
                                () => setShowSuggestions(false),
                                150
                            );
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && event.keyCode === 13)
                                handleOnSearchClick();
                        }}
                    />
                    {suggestLoading ? (
                        <CircularProgress
                            size={16}
                            sx={{ color: 'var(--brand-muted)', mr: 0.5 }}
                        />
                    ) : null}
                    {value !== '' && (
                        <CancelRounded
                            color={'disabled'}
                            sx={{ cursor: 'pointer' }}
                            onClick={handleOnClear}
                        />
                    )}
                    {showSuggestions && (suggestions.length > 0 || suggestLoading) ? (
                        <Paper
                            sx={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                left: 0,
                                right: 0,
                                zIndex: 1200,
                                overflow: 'hidden',
                                borderRadius: 'var(--brand-radius-lg)',
                                border: '1px solid var(--brand-line)',
                                bgcolor: 'var(--brand-paper)'
                            }}>
                            <Box
                                sx={{
                                    px: 1.5,
                                    py: 1,
                                    borderBottom: '1px solid var(--brand-line)'
                                }}>
                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: 'var(--brand-muted)'
                                    }}>
                                    Preview products
                                </Typography>
                            </Box>
                            <List dense sx={{ py: 0 }}>
                                {suggestions.map((item) => (
                                    <ListItemButton
                                        key={item.id}
                                        sx={{ py: 0.75 }}
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => {
                                            setShowSuggestions(false);
                                            navigate(web.productDetail(item.id));
                                        }}>
                                        <ListItemAvatar>
                                            <Avatar
                                                variant={'rounded'}
                                                src={`${
                                                    import.meta.env
                                                        .VITE_API_BASE_URL
                                                }/uploads/thumbs/${item.imageUrl}`}
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    bgcolor: 'var(--brand-cream)'
                                                }}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={item.name}
                                            secondary={item.category?.name}
                                            primaryTypographyProps={{
                                                noWrap: true,
                                                fontSize: 13,
                                                fontWeight: 800
                                            }}
                                            secondaryTypographyProps={{
                                                noWrap: true,
                                                fontSize: 11
                                            }}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        </Paper>
                    ) : null}
                </Box>

                {/* 购物车 */}
                <IconButton
                    sx={{
                        width: 42,
                        height: 42,
                        bgcolor: 'var(--brand-paper)',
                        border: '1px solid var(--brand-line)'
                    }}
                    onClick={() => setOpenCart(true)}>
                    <Badge
                        badgeContent={Number(headerStatus.totalCart)}
                        color={'error'}
                        slotProps={{
                            badge: {
                                sx: {
                                    border: `2px solid #fff`,
                                    transition: '0.6s ease'
                                }
                            }
                        }}>
                        <ShoppingCartRounded />
                    </Badge>
                </IconButton>
            </Toolbar>
            {/** Menu  */}
            <DrawerMenuList
                open={openMenu}
                setOpen={setOpenMenu}
            />
            {/** Cart Data */}
            <DrawerCartList
                open={openCart}
                setOpen={setOpenCart}
            />
        </Container>
    );
};

export default CategorySearchBar;
