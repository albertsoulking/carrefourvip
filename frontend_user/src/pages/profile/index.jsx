import { useEffect, useState } from 'react';
import {
    Box,
    Avatar,
    Typography,
    Button,
    Grid,
    Dialog
} from '@mui/material';
import web from '../../routes/web';
import api from '../../routes/api';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import AddressList from '../delivery_address/AddressList';
import EditProfile from './EditProfile';
import ChangePassword from './ChangePassword';
import { LaunchRounded, CopyAllRounded } from '@mui/icons-material';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import BottomNavigator from '../layout/BottomNavigator';
import { enqueueSnackbar } from 'notistack';
import UserProfile from './UserProfile';
import UserAsset from './UserAsset';
import TopNavigator from '../layout/TopNavigator';

const ProfilePage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useSmartNavigate();
    const [openLanguage, setOpenLanguage] = useState(false);
    const [openEditProfile, setOpenEditProfile] = useState(false);
    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [openAddress, setOpenAddress] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [userData, setUserData] = useState(null);

    const items = [
        {
            label: 'Language',
            isAuth: true,
            onClick: () => setOpenLanguage(true)
        },
        {
            label: 'Edit Profile',
            isAuth: true,
            onClick: () => setOpenEditProfile(true)
        },
        {
            label: 'Change Password',
            isAuth: true,
            onClick: () => setOpenChangePassword(true)
        },
        {
            label: 'My Wallet',
            isAuth: true,
            onClick: () => navigate(web.wallet)
        },
        {
            label: 'Messages',
            isAuth: true,
            onClick: () => navigate(web.messages)
        },
        {
            label: 'Favorites',
            isAuth: true,
            onClick: () => navigate(web.favorite)
        },
        {
            label: 'Delivery Address',
            isAuth: true,
            onClick: () => navigate(web.address)
        },
        {
            label: 'Privacy Policy',
            isAuth: true,
            onClick: () => navigate(web.privacy)
        },
        {
            label: 'Cookie Policy',
            isAuth: true,
            onClick: () => navigate(web.cookie)
        },
        {
            label: 'Sign In',
            isAuth: false,
            onClick: () => navigate(web.login)
        },
        {
            label: 'Sign Out',
            isAuth: true,
            onClick: async () => {
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
            }
        }
    ];

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

    return (
        <Box sx={{ mt: 8, mb: 10, px: 2 }}>
            <TopNavigator
                title={'My Profile'}
                noBack
            />
                {/* <UserProfile />
                <UserAsset /> */}
                <Box
                    display={'flex'}
                    flexDirection={'column'}
                    alignItems={'center'}
                    mb={4}>
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
                                        width: 150,
                                        height: 150,
                                        border: '1px solid #1976d2',
                                        bgcolor: '#222',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        fontSize: 16,
                                        mb: 2
                                    }}
                                    src={imagePreview}
                                    translate={'no'}>
                                    {userData?.name ?? user?.name}
                                </Avatar>
                                <Box
                                    position={'absolute'}
                                    bottom={8}
                                    right={8}
                                    bgcolor={'#fff'}
                                    borderRadius={'50%'}
                                    boxShadow={2}
                                    display={'flex'}
                                    alignItems={'center'}
                                    justifyContent={'center'}
                                    width={40}
                                    height={40}>
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
                    <Box textAlign={'center'}>
                        <Typography
                            fontWeight={600}
                            fontSize={16}>
                            Name:{' '}
                            <Typography
                                component={'span'}
                                fontWeight={400}
                                translate={'no'}>
                                {userData?.name ?? user?.name}
                            </Typography>
                        </Typography>
                        <Typography
                            fontWeight={600}
                            fontSize={16}>
                            Email:{' '}
                            <Typography
                                component={'span'}
                                fontWeight={400}
                                translate={'no'}>
                                {userData?.email ?? user?.email}
                            </Typography>
                        </Typography>
                        <Typography
                            fontWeight={600}
                            fontSize={16}>
                            Balance:{' '}
                            <Typography
                                component={'span'}
                                fontWeight={400}
                                translate={'no'}>
                                {useStyledLocaleString(
                                    userData?.balance ?? user?.balance,
                                    user?.geoInfo
                                )}
                            </Typography>
                        </Typography>
                        <Typography
                            fontWeight={600}
                            fontSize={16}>
                            Point:{' '}
                            <Typography
                                component={'span'}
                                fontWeight={400}
                                translate={'no'}>
                                {userData?.point ?? user?.point}
                            </Typography>
                            <Button
                                size={'small'}
                                sx={{ minWidth: 0 }}
                                onClick={() =>
                                    window.open(
                                        'https://jushop834.cc',
                                        '_blank'
                                    )
                                }>
                                <LaunchRounded fontSize={'small'} />
                            </Button>
                        </Typography>
                        <Typography
                            fontWeight={600}
                            fontSize={16}>
                            Event invitation code:{' '}
                            <Typography
                                component={'span'}
                                fontWeight={400}
                                translate={'no'}>
                                CWLYDQ
                            </Typography>
                            <Button
                                size={'small'}
                                sx={{ minWidth: 0 }}
                                onClick={() =>
                                    navigator.clipboard.writeText('CWLYDQ')
                                }>
                                <CopyAllRounded fontSize={'small'} />
                            </Button>
                        </Typography>
                    </Box>
                </Box>
                <Box component={'form'}>
                    <Grid
                        container
                        spacing={2}
                        sx={{ mb: 2 }}>
                        {items.map(
                            (item, index) =>
                                item.isAuth === !!user && (
                                    <Grid
                                        size={{ xs: 12, md: 6 }}
                                        key={index}>
                                        <Button
                                            variant={'outlined'}
                                            fullWidth
                                            sx={{
                                                fontSize: 16,
                                                fontWeight: 'bold',
                                                textTransform: 'capitalize',
                                                display: 'flex',
                                                borderRadius: 2,
                                                transition:
                                                    'border-bottom-color 0.2s'
                                            }}
                                            onClick={item.onClick}>
                                            {item.label}
                                        </Button>
                                    </Grid>
                                )
                        )}
                    </Grid>
                </Box>
            <BottomNavigator />
            {/** Open Address */}
            <Dialog
                open={openAddress}
                onClose={() => setOpenAddress(false)}>
                <AddressList
                    open={openAddress}
                    setOpen={setOpenAddress}
                />
            </Dialog>
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
};

export default ProfilePage;
