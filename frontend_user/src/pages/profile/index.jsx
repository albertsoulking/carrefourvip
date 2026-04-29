import {
    Box,
    Avatar,
    Typography,
    Grid,
    Paper,
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Divider,
    Button,
    Dialog
} from '@mui/material';

import {
    AccountBalanceWalletRounded,
    StarsRounded,
    ConfirmationNumberRounded,
    CookieRounded,
    PrivacyTipRounded,
    LocationOnRounded,
    FavoriteRounded,
    LogoutRounded,
    ChevronRightRounded,
    LockRounded,
    LanguageRounded,
    ChatRounded,
    FlightRounded,
    ShoppingBagRounded
} from '@mui/icons-material';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import web from '../../routes/web';
import { useEffect, useState } from 'react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import EditProfile from './EditProfile';
import ChangePassword from './ChangePassword';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';
import TopNavigator from '../layout/TopNavigator';
import BottomNavigator from '../layout/BottomNavigator';

export default function ProfilePage() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useSmartNavigate();
    const [openLanguage, setOpenLanguage] = useState(false);
    const [openEditProfile, setOpenEditProfile] = useState(false);
    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
            if (!user) {
                navigate(web.login);
                return;
            }
    
            setImagePreview(
                `${import.meta.env.VITE_API_BASE_URL}/uploads/images/${
                    user?.avatar
                }`
            );
            loadData();
        }, []);

        const loadData = async () => {
        const res = await api.users.getOne({ id: user?.id });

        setUserData(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
    };

    const handleOnUpdateAvatar = async (file) => {
        let imageUrl = user.avatar;
        if (file && file instanceof File) {
            const formData = new FormData();
            formData.append('file', file, file.name);

            const imgRes = await api.utilities.upload(formData);
            imageUrl = imgRes.data.name;
        }

        const payload = {
            id: user?.id,
            avatar: imageUrl
        };

        try {
            const res = await api.users.updateOne(payload);
            localStorage.setItem(
                'user',
                JSON.stringify({
                    ...user,
                    name: res.data.name,
                    avatar: imageUrl
                })
            );
            enqueueSnackbar('User updated successfully!', {
                variant: 'success'
            });
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

    const handleLogout = async () => {
        const payload = {
            userId: user?.id,
            userType: 'user'
        };

        try {
            await api.auth.logout(payload);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate(web.home);
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
            bgcolor='var(--brand-cream)'
            minHeight='100vh'
            pb={'calc(var(--app-bottom-nav-space) + 16px)'}>
                <TopNavigator
                title={'My Profile'}
                noBack
            />
            {/* 🔥 顶部渐变用户卡 */}
            <Box
                sx={{
                    background:
                        'linear-gradient(135deg, rgba(23, 57, 44, 0.96), rgba(54, 99, 75, 0.86))',
                    color: '#fff',
                    pt: 8,
                    px: 3,
                    pb: 5,
                    borderBottomLeftRadius: 28,
                    borderBottomRightRadius: 28,
                    boxShadow: 'var(--brand-shadow)'
                }}>
                <Box
                    display='flex'
                    alignItems='center'>
                    <Box
                        position={'relative'}
                        display={'inline-block'}>
                        <Box
                            position={'relative'}
                            display={'inline-block'}>
                            <input
                                accept={'image/*'}
                                id={'avatar-upload'}
                                type={'file'}
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setImagePreview(
                                            URL.createObjectURL(file)
                                        );
                                        handleOnUpdateAvatar(file);
                                    }
                                }}
                            />
                            <label
                                htmlFor={'avatar-upload'}
                                style={{ cursor: 'pointer' }}>
                                <Avatar
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        mr: 2,
                                        borderRadius: 'var(--brand-radius-md)',
                                        border: '2px solid rgba(255, 255, 255, 0.64)'
                                    }}
                                    variant='rounded'
                                    src={imagePreview} />
                                <Box
                                    position={'absolute'}
                                    bottom={-10}
                                    right={5}
                                    bgcolor={'#fff'}
                                    color={'var(--brand-forest)'}
                                    borderRadius={'50%'}
                                    boxShadow={2}
                                    display={'flex'}
                                    alignItems={'center'}
                                    justifyContent={'center'}
                                    width={25}
                                    height={25}>
                                    <svg
                                        width='36'
                                        height='36'
                                        viewBox='0 0 24 24'>
                                        <path d='M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z' />
                                    </svg>
                                </Box>
                            </label>
                        </Box>
                    </Box>
                    <Box>
                        <Typography
                            fontSize={18}
                            fontWeight={600}>
                            {userData?.name ?? user?.name}
                        </Typography>
                        <Typography fontSize={14}>
                            {userData?.email ?? user?.email}
                        </Typography>
                    </Box>
                    <Box flexGrow={1}></Box>
                    <Button
                        variant='contained'
                        sx={{
                            bgcolor: '#fff',
                            color: 'var(--brand-forest)',
                            '&:hover': { bgcolor: '#fff' }
                        }}
                        onClick={() => setOpenEditProfile(true)}>
                        Edit
                    </Button>
                </Box>
            </Box>

            {/* 💰 钱包 / 积分 */}
            <Box
                px={2}
                mt={-3}>
                <Paper sx={{ borderRadius: 'var(--brand-radius-lg)', p: 2 }}>
                    <Grid
                        container
                        textAlign='center'>
                        <Grid size={{ xs: 4 }}>
                            <AccountBalanceWalletRounded />
                            <Typography fontSize={14}>Balance</Typography>
                            <Typography fontWeight={600}>
                                {useStyledLocaleString(
                                    userData?.balance ?? user?.balance,
                                    user?.geoInfo
                                )}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 4 }}>
                            <StarsRounded />
                            <Typography fontSize={14}>Points</Typography>
                            <Typography fontWeight={600}>
                                {userData?.point ?? user?.point}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 4 }}>
                            <ConfirmationNumberRounded />
                            <Typography fontSize={14}>Coupons</Typography>
                            <Typography fontWeight={600}>0</Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>

            {/* 🛍️ 核心入口（重点） */}
            <Box
                px={2}
                mt={2}>
                <Paper sx={{ borderRadius: 'var(--brand-radius-lg)', overflow: 'hidden' }}>
                    <Grid
                        container
                        textAlign='center'>
                        <Grid
                            size={{ xs: 3 }}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => navigate(web.order)}>
                            <Box py={2}>
                                <ShoppingBagRounded />
                                <Typography fontSize={13}>Orders</Typography>
                            </Box>
                        </Grid>

                        <Grid
                            size={{ xs: 3 }}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => navigate(web.flightBooking)}>
                            <Box py={2}>
                                <FlightRounded />
                                <Typography fontSize={13}>Booking</Typography>
                            </Box>
                        </Grid>

                        <Grid
                            size={{ xs: 3 }}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => navigate(web.wallet)}>
                            <Box py={2}>
                                <AccountBalanceWalletRounded />
                                <Typography fontSize={13}>Wallet</Typography>
                            </Box>
                        </Grid>

                        <Grid
                            size={{ xs: 3 }}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => navigate(web.messages)}>
                            <Box py={2}>
                                <ChatRounded />
                                <Typography fontSize={13}>Messages</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>

            {/* ⚙️ 功能分组 */}
            <Box
                px={2}
                mt={2}>
                {/* Account */}
                <Paper sx={{ borderRadius: 'var(--brand-radius-lg)', mb: 2, overflow: 'hidden' }}>
                    <List sx={{ p: 0, border: 0 }}>
                        <MenuItem
                            icon={<LanguageRounded />}
                            label='Language'
                            onClick={() => setOpenLanguage(true)}
                        />
                        <MenuItem
                            icon={<LockRounded />}
                            label='Change Password'
                            onClick={() => setOpenChangePassword(true)}
                        />
                    </List>
                </Paper>

                {/* My Services */}
                <Paper sx={{ borderRadius: 'var(--brand-radius-lg)', mb: 2, overflow: 'hidden' }}>
                    <List sx={{ p: 0 }}>
                        <MenuItem
                            icon={<FavoriteRounded />}
                            label='Favorites'
                            onClick={() => navigate(web.favorite)}
                        />
                        <MenuItem
                            icon={<LocationOnRounded />}
                            label='Delivery Address'
                            onClick={() => navigate(web.address)}
                        />
                        <MenuItem
                            icon={<PrivacyTipRounded />}
                            label='Privacy Policy'
                            onClick={() => navigate(web.privacy)}
                        />
                        <MenuItem
                            icon={<CookieRounded />}
                            label='Cookie Policy'
                            onClick={() => navigate(web.cookie)}
                        />
                    </List>
                </Paper>

                {/* Logout */}
                <Paper sx={{ borderRadius: 'var(--brand-radius-lg)', overflow: 'hidden' }}>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{ justifyContent: 'center', color: 'error.main' }}>
                        <LogoutRounded sx={{ mr: 1 }} />
                        Sign Out
                    </ListItemButton>
                </Paper>
            </Box>
            <BottomNavigator />
            {/** Open Language */}
            <Dialog
                PaperProps={{
                    sx: {
                        width: 350,
                        maxWidth: 600,
                        m: 1
                    }
                }}
                open={openLanguage}
                onClose={() => setOpenLanguage(false)}>
                <LanguageSwitcher setOpen={setOpenLanguage} />
            </Dialog>
            {/** Open Profile Edit */}
            <Dialog
                PaperProps={{
                    sx: {
                        width: 350,
                        maxWidth: 600,
                        m: 1
                    }
                }}
                open={openEditProfile}
                onClose={() => setOpenEditProfile(false)}>
                <EditProfile setOpen={setOpenEditProfile} />
            </Dialog>
            {/** Open Change Password */}
            <Dialog
                PaperProps={{
                    sx: {
                        width: 350,
                        maxWidth: 600,
                        m: 1
                    }
                }}
                open={openChangePassword}
                onClose={() => setOpenChangePassword(false)}>
                <ChangePassword setOpen={setOpenChangePassword} />
            </Dialog>
        </Box>
    );
}

function MenuItem({ icon, label, onClick }) {
    return (
        <>
            <ListItemButton onClick={onClick}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
                <ChevronRightRounded />
            </ListItemButton>
            <Divider />
        </>
    );
}
