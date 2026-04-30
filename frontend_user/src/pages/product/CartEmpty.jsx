import { Card, CardContent, Grid, Typography } from '@mui/material';
import assets from '../../assets';

const CartEmpty = () => {
    return (
        <Card
            elevation={0}
            sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
                <Typography
                    textAlign={'center'}
                    fontWeight={'bold'}>
                    Your Cart Items
                </Typography>
                <Grid sx={{ textAlign: 'center', my: 2 }}>
                    <img
                        src={assets.empty_cart}
                        alt={'Empty Cart'}
                        style={{ width: 150, objectFit: 'cover' }}
                    />
                </Grid>
                <Typography
                    fontWeight={'bold'}
                    fontSize={24}
                    textAlign={'center'}>
                    Let's start shopping!
                </Typography>
            </CardContent>
        </Card>
    );
};

export default CartEmpty;
