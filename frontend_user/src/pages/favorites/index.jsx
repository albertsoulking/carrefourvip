import { Box, Pagination } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import FavoriteItem from './FavoriteItem';
import web from '../../routes/web';
import TopNavigator from '../layout/TopNavigator';

const FavoritePage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [searchModal, setSearchModal] = useState({
        page: 1,
        limit: 10
    });
    const [favoriteData, setFavoriteData] = useState({
        data: [],
        total: 0,
        page: 1,
        lastPage: 0
    });

    useEffect(() => {
        loadData(searchModal);
    }, []);

    const loadData = async (payload) => {
        if (!user) return;

        setSearchModal(payload);

        const res = await api.favorites.getMyFavorites(payload);
        setFavoriteData(res.data);
    };

    return (
        <Box
            sx={{
                pt: 'var(--app-top-bar-space)',
                pb: 4,
                minHeight: '100vh',
                position: 'relative',
                bgcolor: 'var(--brand-cream)'
            }}>
            <TopNavigator
                backText={'Profile'}
                backPath={web.profile}
                title={'My Favorites'}
            />
            <Box sx={{ p: 1.5 }}>
                {favoriteData.data.map((fav) => (
                    <FavoriteItem
                        key={fav.id}
                        data={fav}
                        loadData={loadData}
                        searchModal={searchModal}
                    />
                ))}
            </Box>
            <Box
                my={4}
                display={'flex'}
                justifyContent={'center'}
                translate={'no'}>
                <Pagination
                    count={favoriteData.lastPage}
                    page={favoriteData.page}
                    onChange={(e, newPage) => {
                        loadData({
                            ...searchModal,
                            page: newPage
                        });
                    }}
                />
            </Box>
        </Box>
    );
};

export default FavoritePage;
