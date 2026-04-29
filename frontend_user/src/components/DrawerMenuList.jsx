import { CategoryRounded, CloseRounded } from '@mui/icons-material';
import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
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
                sx: {
                    width: { xs: '86%', sm: 360 },
                    maxWidth: 420,
                    bgcolor: 'var(--brand-cream)',
                    borderRight: '1px solid var(--brand-line)'
                }
            }}
            onClose={() => setOpen(false)}>
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                    bgcolor: 'var(--brand-nav)',
                    borderBottom: '1px solid var(--brand-line)',
                    backdropFilter: 'blur(var(--brand-blur))'
                }}>
                <Stack
                    direction={'row'}
                    spacing={1}
                    alignItems={'center'}>
                    <Box
                        sx={{
                            width: 38,
                            height: 38,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 'var(--brand-radius-md)',
                            bgcolor: 'var(--brand-forest)',
                            color: '#fff'
                        }}>
                        <CategoryRounded fontSize={'small'} />
                    </Box>
                    <Box>
                        <Typography
                            fontSize={18}
                            fontWeight={800}
                            color={'var(--brand-ink)'}>
                            Categories
                        </Typography>
                        <Typography
                            fontSize={12}
                            color={'var(--brand-muted)'}>
                            Browse product sections
                        </Typography>
                    </Box>
                </Stack>
                <IconButton
                    sx={{
                        border: '1px solid var(--brand-line)',
                        bgcolor: 'var(--brand-paper)'
                    }}
                    onClick={() => setOpen(false)}>
                    <CloseRounded />
                </IconButton>
            </Box>
            <NavBar
                categories={categories}
                setOpenMenu={setOpen}
            />
        </Drawer>
    );
}
