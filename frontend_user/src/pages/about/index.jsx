import { Box, Typography, Grid } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import assets from '../../assets';

const AboutPage = () => {
    return (
        <Box
            px={2}
            py={6}>
            <Typography
                variant='h4'
                gutterBottom>
                About Zenviquea LLC
            </Typography>
            <Typography variant='body1'>
                Zenviquea LLC is an e-commerce platform that sources consumer
                goods and lifestyle products from international and local
                suppliers and sells them to customers in Europe and North
                America through an online storefront. Our business model
                includes direct-to-consumer sales, inventory management, and
                international logistics partnerships.
            </Typography>
            <Box sx={{ my: 3 }}>
                <img
                    src={assets.logo}
                    style={{ maxWidth: 180 }}
                />
            </Box>
            <Typography
                variant='h6'
                gutterBottom>
                Business Details
            </Typography>
            <Grid
                container
                spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                        display='flex'
                        alignItems='center'>
                        <LanguageIcon sx={{ mr: 1 }} />
                        <Typography>https://zenviquea.com</Typography>
                    </Box>
                    <Box
                        display='flex'
                        alignItems='center'
                        mt={1}>
                        <EmailIcon sx={{ mr: 1 }} />
                        <Typography>head@zenviquea.com</Typography>
                    </Box>
                    <Box
                        display='flex'
                        alignItems='center'
                        mt={1}>
                        <PhoneIcon sx={{ mr: 1 }} />
                        <Typography>+1 (929) 305-0668</Typography>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                        display='flex'
                        alignItems='center'>
                        <LocationOnIcon sx={{ mr: 1 }} />
                        <Typography>
                            6420 Kit Ln, Maumee, OH 43537, USA
                        </Typography>
                    </Box>
                    <Box mt={2}>
                        <Typography variant='body2'>
                            <strong>Company Representative:</strong> Oliver Smitch
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
            <Box mt={4}>
                <Typography
                    variant='body2'
                    color='text.secondary'>
                    *This page is used for business verification purposes and
                    reflects the official identity of Zenviquea LLC.*
                </Typography>
            </Box>
        </Box>
    );
};

export default AboutPage;
