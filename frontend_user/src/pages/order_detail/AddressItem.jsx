import { Box, Typography } from '@mui/material';

const AddressItem = ({ userName, userAddress, userMobile }) => {
    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant={'body1'} fontWeight={'bold'}>
                Shipping Address
            </Typography>
            <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}>
                <Typography variant={'body2'}>Name:</Typography>
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
                <Typography variant={'body2'}>Address:</Typography>
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
                <Typography variant={'body2'}>Phone:</Typography>
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
