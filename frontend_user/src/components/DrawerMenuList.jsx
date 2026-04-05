import { CloseRounded } from '@mui/icons-material';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import NavBar from './NavBar';
import { useEffect } from 'react';
import api from '../routes/api';
import { useState } from 'react';

export default function DrawerMenuList({
    open,
    setOpen
}) {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const payload = {
            isActive: 1,
            page: 1,
            limit: 100,
            orderBy: 'asc',
            sortBy: 'displayOrder'
        };

        const cates = await api.categories.getAll(payload);
        setCategories(cates.data);
    };

    return (
        <Drawer
            anchor={'left'}
            open={open}
            sx={{ '.MuiCard-root': { overflow: 'auto' } }}
            PaperProps={{
                sx: { width: 360 }
            }}
            onClose={() => setOpen(false)}>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                justifyItems={'center'}>
                <IconButton
                    sx={{
                        width: '100%',
                        inlineSize: 'auto',
                        color: '#fff',
                        bgcolor: '#fff'
                    }}
                    disabled>
                    <CloseRounded
                        sx={{ color: '#fff' }}
                    />
                </IconButton>
                <Typography
                    fontSize={18}
                    fontWeight={'bold'}
                    sx={{ lineHeight: 2.5 }}>
                    Menu
                </Typography>
                <IconButton
                    sx={{
                        width: '100%',
                        inlineSize: 'auto'
                    }}
                    onClick={() => setOpen(false)}>
                    <CloseRounded color={'error'} />
                </IconButton>
            </Box>
            <NavBar
                categories={categories}
                setOpenMenu={setOpen}
            />
        </Drawer>
    );
}
