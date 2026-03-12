import { Card, CardContent, Grid, Typography } from '@mui/material';
import assets from '../../assets';

const CartEmpty = () => {
    return (
        <Card
            elevation={0}
            sx={{ borderRadius: 5, maxWidth: 360, height: '100%' }}>
            <CardContent>
                <Typography
                    textAlign={'center'}
                    fontWeight={'bold'}>
                    Your Cart Items
                </Typography>
                <Grid sx={{ textAlign: 'center', my: 2 }}>
                    <img
                        src={assets.food_car}
                        alt={'Food Car'}
                        style={{ width: 150, objectFit: 'cover' }}
                    />
                </Grid>
                <Typography
                    fontWeight={'bold'}
                    fontSize={24}
                    textAlign={'center'}>
                    What do you want to buy?
                </Typography>
                <Typography
                    variant={'h6'}
                    fontSize={18}
                    fontWeight={'normal'}
                    textAlign={'center'}
                    sx={{ my: 2, color: '#000000' }}>
                    You haven't added anything to your cart!
                </Typography>
            </CardContent>
        </Card>
    );
};

export default CartEmpty;
