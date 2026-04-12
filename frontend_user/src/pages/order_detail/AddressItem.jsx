import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const AddressItem = ({ userName, userAddress, userMobile }) => {
    const { t } = useTranslation();
    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant={'body1'} fontWeight={'bold'}>
                {t('orderDetail.address.title')}
            </Typography>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>{t('orderDetail.address.name')}:</Typography>
                <Typography
                    variant={'body2'}
                    textAlign={'right'}
                    translate={'no'}>
                    {userName}
                </Typography>
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>{t('orderDetail.address.address')}:</Typography>
                <Typography
                    variant={'body2'}
                    textAlign={'right'}
                    translate={'no'}>
                    {userAddress}
                </Typography>
            </Box>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>{t('orderDetail.address.phone')}:</Typography>
                <Typography
                    variant={'body2'}
                    textAlign={'right'}
                    translate={'no'}>
                    {userMobile}
                </Typography>
            </Box>
        </Box>
    );
};

export default AddressItem;
