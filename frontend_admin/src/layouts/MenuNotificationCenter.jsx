import { Menu, Typography, Divider, Box, Button } from '@mui/material';
import {
    AssignmentTurnedInRounded,
    CircleRounded,
    LocalShippingRounded,
    PersonRounded
} from '@mui/icons-material';
import useSmartNavigate from '../hooks/useSmartNavigate';
import api from '../routes/api';
import { useState } from 'react';

export default function MenuNotificationCenter({
    data,
    anchorEl,
    setAnchorEl,
    loadNotification
}) {
    const navigate = useSmartNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [visibleCount, setVisibleCount] = useState(5);
    const visibleData = data.slice(0, visibleCount);

    const handleOnMarkAllAsRead = async () => {
        await api.noti.markAllasRead();
        loadNotification();
    };

    const handleOnRead = async ({ id, path }) => {
        await api.noti.update({ ids: [id] });
        setAnchorEl(null);
        navigate(path);
        loadNotification();
    };
    
    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
                sx: { width: 320, maxHeight: 500, p: 1 }
            }}>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography
                    variant={'subtitle1'}
                    fontWeight={'bold'}
                    sx={{ p: 1 }}>
                    系统通知
                </Typography>
                <Button
                    size={'small'}
                    sx={{ fontSize: 12 }}
                    onClick={handleOnMarkAllAsRead}>
                    全部标记为已读
                </Button>
            </Box>

            <Divider sx={{ mb: 0.5 }} />

            {visibleData.map((noti, idx) => (
                <Box
                    key={idx}
                    onClick={() => handleOnRead(noti)}
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 0.5,
                        cursor: 'pointer',
                        borderRadius: 2,
                        ':hover': {
                            bgcolor: 'gainsboro'
                        },
                        position: 'relative'
                    }}>
                    <Box mr={1}>
                        {noti.type === 'order' ? (
                            <LocalShippingRounded color={'primary'} />
                        ) : noti.type === 'user' ? (
                            <PersonRounded color='primary' />
                        ) : (
                            <AssignmentTurnedInRounded />
                        )}
                    </Box>
                    <Box
                        display={'flex'}
                        flexDirection={'column'}
                        width={'100%'}>
                        <Typography
                            variant={'subtitle2'}
                            fontWeight={'bold'}>
                            {noti.title}
                        </Typography>
                        <Typography variant={'caption'}>
                            {noti.content}
                        </Typography>
                        <Typography
                            variant={'caption'}
                            color={'text.secondary'}>
                            {new Date(noti.createdAt).toLocaleString()}
                        </Typography>
                    </Box>
                    {noti.adminNotification.find((a) => a.admin.id === user.id)
                        ?.isRead === 0 &&
                        noti.enableNoti === 1 && (
                            <CircleRounded
                                color={'error'}
                                sx={{ fontSize: 10, float: 'right' }}
                            />
                        )}
                    <Divider
                        sx={{
                            position: 'absolute',
                            width: '100%',
                            bottom: 0
                        }}
                    />
                </Box>
            ))}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 1
                }}>
                <Button
                    size={'small'}
                    fullWidth
                    onClick={() => setVisibleCount((prev) => prev + 5)}>
                    More
                </Button>
            </Box>
        </Menu>
    );
}
