// pages/NotFoundPage.jsx
import { Box, Typography, Button } from '@mui/material';
import useSmartNavigate from '../../hooks/useSmartNavigate';
import web from '../../routes/web';

export default function NotFoundPage() {
    const navigate = useSmartNavigate();

    return (
        <Box
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'center'}
            height={'100vh'}
            width={'100vw'}
            textAlign={'center'}
            bgcolor={'#fff'}>
            <Typography
                fontSize={200}
                fontWeight={700}
                color={'primary'}>
                404
            </Typography>
            <Typography
                variant={'h5'}
                mb={2}>
                页面未找到
            </Typography>
            <Typography
                variant={'body2'}
                color={'text.secondary'}
                mb={4}>
                抱歉，您访问的页面不存在。
            </Typography>
            <Button
                variant={'outlined'}
                onClick={() => navigate(web.home)}>
                返回首页
            </Button>
        </Box>
    );
}
