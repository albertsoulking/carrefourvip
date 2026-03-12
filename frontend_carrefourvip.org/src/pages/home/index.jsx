import BannerOne from './BannerOne';
import BannerThree from './BannerThree';
import BannerFour from './BannerFour';
import BannerFive from './BannerFive';
import BannerSix from './BannerSix';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import BannerSeven from './BannerSeven';
import { Box } from '@mui/material';
import BottomNavigator from '../layout/BottomNavigator';
import HeaderBar from '../layout/HeaderBar';
import RecommandZone from './RecommandZone';
import api from '../../routes/api';
import { useState } from 'react';
import NewestZone from './LatestZone';

const HomePage = () => {
    const [searchParams] = useSearchParams();
    const [logo, setLogo] = useState('');
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        const referralCode = searchParams.get('ref');
        const storedCode = localStorage.getItem('code');

        if (referralCode && referralCode !== storedCode) {
            localStorage.setItem('code', referralCode);
        }

        loadData();
    }, []);

    const loadData = async () => {
        const payload = {
            key: 'website',
            group: 'setting'
        };

        const res = await api.settings.get(payload);
        setLogo(res.data?.logo || '');
        setBanners(
            res.data?.homepageBanner
                ? res.data.homepageBanner.split(',').filter(Boolean)
                : []
        );
    };

    return (
        <Box>
            <HeaderBar logo={logo} />
            <Box mb={7}></Box>
            <BannerOne banners={banners} />
            <BannerThree />
            <BannerFour />
            {/* <BannerFive /> */}
            <NewestZone />
            <RecommandZone />
            <BannerSix />
            {/* <BannerSeven /> */}
            <Box mb={8}></Box>
            <BottomNavigator />
        </Box>
    );
};

export default HomePage;
