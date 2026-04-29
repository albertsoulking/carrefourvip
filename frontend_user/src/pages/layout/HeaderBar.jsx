import {
    Box,
    Toolbar,
    Typography,
    IconButton,
    Container,
    Badge
} from '@mui/material';
import { ShoppingCartRounded } from '@mui/icons-material';
import web from '../../routes/web';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { useState } from 'react';
import { useEffect } from 'react';
import api from '../../routes/api';
import DrawerMenuList from '../../components/DrawerMenuList';
import DrawerCartList from '../../components/DrawerCartList';
import useNotificationSocket from '../../hooks/userNotificationSocket';

const HeaderBar = ({ logo }) => {
    const navigate = useSmartNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [headerStatus, setHeaderStatus] = useState({
        totalUnread: 0,
        totalFavorite: 0,
        totalCart: 0,
        totalUnpaid: 0
    });
    const [openMenu, setOpenMenu] = useState(false);
    const [openCart, setOpenCart] = useState(false);

    const items = [
        {
            icon: <ShoppingCartRounded color={'primary'} />,
            color: 'error',
            count: headerStatus.totalCart,
            onClick: () => setOpenCart(true)
        }
    ];

    useNotificationSocket((noti) => {
        if (noti.type !== 'cart') return;

        loadHeaderStatus();
    });

    useEffect(() => {
        loadHeaderStatus();
    }, []);

    const loadHeaderStatus = async () => {
        if (!user) return;

        const res = await api.header.getStatus();
        setHeaderStatus(res.data);
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
            <Toolbar sx={{ justifyContent: 'center' }}>
                <Box
                    component={'img'}
                    src={`${
                        import.meta.env.VITE_API_BASE_URL
                    }/uploads/images/${logo}`}
                    alt={'logo'}
                    style={{
                        objectFit: 'cover',
                        height: 50,
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate(web.home)}
                />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography
                        sx={{
                            fontWeight: 700,
                            fontSize: 22,
                            color: 'var(--brand-ink)',
                            fontFamily: 'var(--font-display)'
                        }}
                        textAlign={'center'}
                        translate={'no'}>
                        Carre
                        <Box
                            component={'span'}
                            sx={{ color: '#FFA500' }}
                            translate={'no'}>
                            four
                        </Box>
                    </Typography>
                </Box>
                <Box>
                    {items.map((item, index) => (
                        <IconButton
                            key={index}
                            onClick={item.onClick}>
                            <Badge
                                badgeContent={Number(item.count)}
                                color={item.color}
                                slotProps={{
                                    badge: {
                                        sx: {
                                            border: `2px solid #fff`,
                                            transition: '0.6s ease'
                                        }
                                    }
                                }}>
                                {item.icon}
                            </Badge>
                        </IconButton>
                    ))}
                </Box>
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

export default HeaderBar;
