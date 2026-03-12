import { Avatar, Box, Dialog, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import ModalViewImage from './ModalViewImage';
import { BorderColorOutlined } from '@mui/icons-material';
import EditProfile from './EditProfile';

const UserProfile = () => {
    const [openImage, setOpenImage] = useState(false);
    const [openProfie, setOpenProfile] = useState(false);

    return (
        <Box
            display={'flex'}
            justifyContent={'space-between'}>
            <Avatar
                sx={{
                    width: 60,
                    height: 60
                }}
                src={'albert'}
                onClick={() => setOpenImage(true)}
            />
            <Typography
                translate={'no'}
                ml={2}
                fontWeight={'bold'}
                variant={'h6'}
                width={'100%'}
                noWrap>
                Albert Soulking ABCKKD sdkflsdkj
            </Typography>
            <IconButton
                color={'primary'}
                onClick={() => setOpenProfile(true)}>
                <BorderColorOutlined />
            </IconButton>
            <ModalViewImage
                image={''}
                open={openImage}
                setOpen={setOpenImage}
            />
            <Dialog
                open={openProfie}
                onClose={() => setOpenProfile(false)}>
                <EditProfile setOpen={setOpenProfile} />
            </Dialog>
        </Box>
    );
};

export default UserProfile;
