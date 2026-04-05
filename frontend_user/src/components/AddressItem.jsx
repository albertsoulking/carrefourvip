import { ArrowForwardIosRounded, LocationOnRounded } from '@mui/icons-material';
import { Card, CardActionArea, Box, Typography, Drawer } from '@mui/material';
import { useState } from 'react';
import AddressList from '../pages/delivery_address/AddressList';
import { useEffect } from 'react';
import api from '../routes/api';

const AddressItem = ({
    selectedAddress,
    setSelectedAddress
}) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectAddress, setSelectAddress] = useState(null);

    useEffect(() => {
        if (!user) return;

        loadData();
    }, [selectAddress]);

    const loadData = async () => {
        const res = await api.locations.getMyLocations();

        if (res.data.length === 0) {
            setSelectedAddress(null);
            return;
        }

        const primary = res.data.find((item) => item.isPrimary);
        const selected = res.data.find((item) => item.id === selectAddress);

        setSelectedAddress((prev) => {
            if (prev === null) {
                if (selectAddress === null) {
                    return primary ?? null;
                } else {
                    return selected ?? primary ?? null;
                }
            }

            if (selectAddress === null) {
                return prev;
            }

            return selected ?? primary ?? null;
        });
    };

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
                    <LocationOnRounded color={'primary'} />
                </Box>
                <Box
                    display={'flex'}
                    flexDirection={'column'}
                    width={'100%'}
                    mx={2}>
                    {selectedAddress === null ? (
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
                                fontSize: 13
                            }}>
                            Click to select address
                        </Typography>
                    ) : (
                        <Typography
                            fontSize={12}
                            color={'text.primary'}
                            sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                            translate={'no'}>
                            {selectedAddress.receiverName}{' '}
                            {selectedAddress.receiverMobile}
                            <br />
                            {selectedAddress.address}/{selectedAddress.city}/
                            {selectedAddress.state}/{selectedAddress.country}
                        </Typography>
                    )}
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
                <AddressList
                    setOpen={setOpenDrawer}
                    setSelectAddress={setSelectAddress}
                    setSelectedAddress={setSelectedAddress}
                />
            </Drawer>
        </Card>
    );
};

export default AddressItem;
