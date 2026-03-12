import {
    ApartmentRounded,
    EmailRounded,
    LanguageRounded,
    LocationOnRounded,
    PhoneRounded
} from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

const BannerSeven = () => {
    return (
        <Box p={2}>
            <Typography
                variant={'h6'}
                gutterBottom
                mb={2}>
                Business Details
            </Typography>
            <Box
                display={'flex'}
                alignItems={'center'}
                mb={1}>
                <ApartmentRounded sx={{ mr: 1 }} />
                <Typography translate={'no'}>Carrefourvip LLC</Typography>
            </Box>
            <Box
                display={'flex'}
                alignItems={'center'}
                mb={1}>
                <LanguageRounded sx={{ mr: 1 }} />
                <Typography translate={'no'}>
                    https://carevourvip.com
                </Typography>
            </Box>
            <Box
                display={'flex'}
                alignItems={'center'}
                mb={1}>
                <EmailRounded sx={{ mr: 1 }} />
                <Typography translate={'no'}>
                    carrefour@carevourvip.com
                </Typography>
            </Box>
            <Box
                display={'flex'}
                alignItems={'center'}
                mb={1}>
                <PhoneRounded sx={{ mr: 1 }} />
                <Typography translate={'no'}>+1 (929) 305-0668</Typography>
            </Box>
            <Box
                display={'flex'}
                alignItems={'center'}
                mb={1}>
                <LocationOnRounded sx={{ mr: 1 }} />
                <Typography translate={'no'}>
                    6420 Kit Ln, Maumee, OH 43537, USA
                </Typography>
            </Box>
            <Typography
                variant={'body2'}
                color={'text.secondary'}
                mt={2}>
                *This page is used for business verification purposes and
                reflects the official identity of Carrefourvip LLC.*
            </Typography>
        </Box>
    );
};

export default BannerSeven;
