import {
    ArrowForwardIosRounded,
    LocalShippingRounded
} from '@mui/icons-material';
import { Card, CardActionArea, Box, Typography, Drawer } from '@mui/material';
import { useState } from 'react';
import AddressMethod from '../pages/delivery_address/AddressMethod';
import assets from '../assets';

const DeliveryItem = ({
    data,
    selectedIds,
    shippingFee,
    setShippingFee,
    setUserSelectedManually,
    deliveryData
}) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [openDrawer, setOpenDrawer] = useState(false);

    return (
        <Card
            sx={{
                mb: 1,
                borderRadius: 2,
                boxShadow: 'rgba(0, 0, 0, 0.1) 0 4px 12px',
                minHeight: 50,
                maxHeight: 120
            }}>
            <CardActionArea
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '100%',
                    px: 2
                }}
                onClick={() => setOpenDrawer(true)}>
                <Box>
                    <LocalShippingRounded color={'primary'} />
                </Box>
                <Box
                    display={'flex'}
                    width={'100%'}
                    alignItems={'center'}
                    mx={2}>
                    {shippingFee.type === 'express' && (
                        <img
                            src={assets.express}
                            alt={'express'}
                            style={{ height: 15, objectFit: 'contain' }}
                            translate={'no'}
                        />
                    )}
                    <Typography
                        variant='body2'
                        color='text.primary'
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            mt: 0.5,
                            ml: 1,
                            fontSize: 13
                        }}>
                        {shippingFee.type.charAt(0).toUpperCase() +
                            shippingFee.type.slice(1)}{' '}
                        Delivery
                    </Typography>
                </Box>
                <Box>
                    <ArrowForwardIosRounded
                        color={'primary'}
                        fontSize={'small'}
                    />
                </Box>
            </CardActionArea>
            <Drawer
                open={openDrawer}
                anchor={'right'}
                onClose={() => setOpenDrawer(false)}
                PaperProps={{
                    sx: { width: 340 }
                }}>
                <AddressMethod
                    data={data}
                    selectedIds={selectedIds}
                    setOpen={setOpenDrawer}
                    shippingFee={shippingFee}
                    setShippingFee={setShippingFee}
                    setUserSelectedManually={setUserSelectedManually}
                    user={user}
                    deliveryData={deliveryData}
                />
            </Drawer>
        </Card>
    );
};

export default DeliveryItem;
