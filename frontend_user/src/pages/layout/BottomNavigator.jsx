import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
    CategoryRounded,
    HomeRounded,
    PersonRounded,
    FlightTakeoff
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import web from '../../routes/web';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const MotionAction = motion(BottomNavigationAction);

const BottomNavigator = () => {
    const location = useLocation();
    const [value, setValue] = useState(location.pathname);
    const navigate = useSmartNavigate();

    useEffect(() => {
        setValue(location.pathname);
    }, [location]);

    const handleChange = (newValue) => {
        setValue(newValue);
        navigate(newValue);
    };

    const items = [
        { label: 'Home', value: web.home, icon: <HomeRounded /> },
        { label: 'Products', value: web.products, icon: <CategoryRounded /> },
        { label: 'Flights', value: web.flight, icon: <FlightTakeoff />, center: true },
        { label: 'Me', value: web.profile, icon: <PersonRounded /> }
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                position: 'fixed',
                bottom: 10,
                left: 12,
                right: 12,
                maxWidth: 'sm',
                mx: 'auto',
                zIndex: 999,

                background: 'rgba(255,255,255,0.22)',
                backdropFilter: 'blur(18px) saturate(160%)',
                WebkitBackdropFilter: 'blur(18px) saturate(160%)',

                borderRadius: '30px',
                border: '1px solid rgba(255,255,255,0.35)',

                boxShadow: `
                    0 6px 25px rgba(0,0,0,0.12),
                    inset 0 1px rgba(255,255,255,0.6)
                `
            }}
        >
            <BottomNavigation
                value={value}
                onChange={(e, newValue) => handleChange(newValue)}
                showLabels
                sx={{
                    background: 'transparent',
                    height: 64
                }}
            >
                {items.map((item) => {
                    const selected = value === item.value;

                    return (
                        <MotionAction
                            key={item.value}
                            label={item.label}
                            value={item.value}
                            icon={item.icon}
                            onClick={() => handleChange(item.value)}
                            animate={{
                                y: item.center
                                    ? selected
                                        ? -6
                                        : -2
                                    : selected
                                    ? -3
                                    : 0,
                                scale: selected ? 1.05 : 1
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 20
                            }}
                            sx={{
                                position: 'relative',
                                color: selected ? '#007aff' : 'rgba(0,0,0,0.6)',

                                '& .MuiSvgIcon-root': {
                                    fontSize: item.center ? 26 : 24
                                },

                                '&::before': selected
                                    ? {
                                          content: '""',
                                          position: 'absolute',
                                          top: 8,
                                          bottom: 4,
                                          left: 6,
                                          right: 6,
                                          borderRadius: '25px',
                                          background:
                                              'linear-gradient(145deg, rgba(0,0,0,0.2), rgba(255,255,255,0.15))',
                                          zIndex: -1,
                                        //   width: 80,
                                      }
                                    : {}
                            }}
                        />
                    );
                })}
            </BottomNavigation>
        </Paper>
    );
};

export default BottomNavigator;