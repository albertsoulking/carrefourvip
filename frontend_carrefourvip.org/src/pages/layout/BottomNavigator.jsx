import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
    CategoryRounded,
    AssignmentRounded,
    HomeRounded,
    PersonRounded
} from '@mui/icons-material';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import web from '../../routes/web';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const BottomNavigator = () => {
    const location = useLocation();
    const [value, setValue] = useState(location.pathname);
    const navigate = useSmartNavigate();

    useEffect(() => {
        setValue(location.pathname);
    }, [location]);

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                maxWidth: 'sm',
                m: '0 auto',
                zIndex: 999,
                bgcolor: 'rgb(255 255 255 / 80%)',
                backdropFilter: 'blur(10px)'
            }}
            elevation={3}>
            <BottomNavigation
                value={value}
                onChange={(event, newValue) => {
                    setValue(newValue);
                    navigate(newValue);
                }}
                showLabels
                sx={{ bgcolor: 'transparent' }}>
                <BottomNavigationAction
                    label={'Home'}
                    value={web.home}
                    icon={<HomeRounded />}
                />
                <BottomNavigationAction
                    label={'Product'}
                    value={web.products}
                    icon={<CategoryRounded />}
                />
                <BottomNavigationAction
                    label={'Order'}
                    value={web.order}
                    icon={<AssignmentRounded />}
                />
                <BottomNavigationAction
                    label={'Me'}
                    value={web.profile}
                    icon={<PersonRounded />}
                />
            </BottomNavigation>
        </Paper>
    );
};

export default BottomNavigator;
