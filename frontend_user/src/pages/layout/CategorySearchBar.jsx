import {
    Container,
    Toolbar,
    IconButton,
    InputBase,
    Box,
    Badge
} from '@mui/material';
import {
    ShoppingCartRounded,
    SearchRounded,
    MenuRounded,
    CancelRounded
} from '@mui/icons-material';
import DrawerMenuList from '../../components/DrawerMenuList';
import { useEffect, useState } from 'react';
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

        navigate(`${web.products}?${payload}`);
    };

    const handleOnClear = () => {
        setValue('');
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
                bgcolor: 'rgba(247, 242, 232, 0.86)',
                backdropFilter: 'blur(18px)',
                borderBottom: '1px solid var(--brand-line)',
                boxShadow: '0 10px 24px rgba(23, 57, 44, 0.08)'
            }}
            disableGutters>
            <Toolbar>
                <IconButton
                    sx={{
                        width: 42,
                        height: 42,
                        bgcolor: '#fffdfa',
                        border: '1px solid var(--brand-line)'
                    }}
                    onClick={() => setOpenMenu(true)}>
                    <MenuRounded />
                </IconButton>
                {/* 搜索框 */}
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: '#fffdfa',
                        border: '1px solid var(--brand-line)',
                        borderRadius: '18px',
                        px: 1.5,
                        py: 0.25,
                        mx: 1,
                        boxShadow: '0 10px 22px rgba(23, 57, 44, 0.07)'
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
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && event.keyCode === 13)
                                handleOnSearchClick();
                        }}
                    />
                    {value !== '' && (
                        <CancelRounded
                            color={'disabled'}
                            sx={{ cursor: 'pointer' }}
                            onClick={handleOnClear}
                        />
                    )}
                </Box>

                {/* 购物车 */}
                <IconButton
                    sx={{
                        width: 42,
                        height: 42,
                        bgcolor: '#fffdfa',
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
