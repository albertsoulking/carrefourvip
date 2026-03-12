import { Box, Grid, Typography } from '@mui/material';
import assets from '../../assets';
import { enqueueSnackbar } from 'notistack';

const BannerFive = () => {
    return (
        <Grid
            sx={{
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1
            }}>
            <Typography
                fontSize={18}
                color={'primary'}
                textAlign={'center'}
                sx={{
                    fontFamily: '"Alex Brush", cursive'
                }}>
                Special Event Zone
            </Typography>
            <img
                src={assets.jumia}
                style={{ width: '100%', objectFit: 'cover', cursor: 'pointer' }}
                alt={'image'}
                onClick={() => window.open('https://jushop834.cc', '_blank')}
            />
            <Typography
                fontSize={12}
                mx={2}
                sx={{
                    color: '#211f28cc'
                }}>
                Carrefour, in partnership with its strategic partner, JUMIA
                Mall, has officially launched a member points program. Carrefour
                members can earn points and commissions through shopping and
                enjoy exclusive rewards. Please use the special invitation code
                to register and participate:{' '}
                <span
                    style={{
                        fontWeight: 'bold',
                        color: '#1976d2',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                    onClick={() => {
                        navigator.clipboard.writeText('CWLYDQ');
                        enqueueSnackbar('Invitation Code Copied!', {
                            variant: 'success'
                        });
                    }}
                    translate={'no'}>
                    CWLYDQ
                </span>
            </Typography>
        </Grid>
    );
};

export default BannerFive;
