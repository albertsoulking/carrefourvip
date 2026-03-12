import { Box, Button, Typography } from '@mui/material';

const UserAsset = () => {
    return (
        <Box
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}>
            <Box width={'100%'} bgcolor={'violet'}>
                <Typography>Balance</Typography>
                <Typography>1000</Typography>
                <Button>Deposit</Button>
            </Box>
            <Box width={'100%'} bgcolor={'slategray'}>
                <Typography>Points</Typography>
                <Typography>50</Typography>
                <Button>ABCDEF</Button>
            </Box>
        </Box>
    );
};

export default UserAsset;
