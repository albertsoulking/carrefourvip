import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Typography
} from '@mui/material';

const ModalViewCustomer = ({
    open,
    data,
    setOpen
}) => {
    const handleOnClose = () => {
        setOpen({ open: false, data: null });
    };

    return (
        <Dialog
            open={open}
            onClose={handleOnClose}
            maxWidth={'md'}
            fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                客户详情: #{data?.id} [{data?.name}/{data?.email}]
            </DialogTitle>
            <DialogContent dividers>
                <Box display={'flex'}>
                    <Avatar
                        variant={'rounded'}
                        sx={{ width: 120, height: 120 }}
                    />
                    <Box>
                        <Box display={'flex'}>
                            <Typography>姓名：</Typography>
                            <Typography>{data?.name}</Typography>
                        </Box>
                        <Box display={'flex'}>
                            <Typography>邮箱：</Typography>
                            <Typography>{data?.email}</Typography>
                        </Box>
                        <Box display={'flex'}>
                            <Typography>手机：</Typography>
                            <Typography>{data?.phone}</Typography>
                        </Box>
                    </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box>
                    <Box display={'flex'}>
                        <Typography>登录IP：</Typography>
                        <Typography>{data?.ip}</Typography>
                    </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box>
                    <Box display={'flex'}>
                        <Typography>城市：</Typography>
                        <Typography>{data?.city}</Typography>
                    </Box>
                    <Box display={'flex'}>
                        <Typography>邮编：</Typography>
                        <Typography>{data?.zipCode}</Typography>
                    </Box>
                    <Box display={'flex'}>
                        <Typography>省/地区：</Typography>
                        <Typography>{data?.state}</Typography>
                    </Box>
                    <Box display={'flex'}>
                        <Typography>国家：</Typography>
                        <Typography>{data?.country}</Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    sx={{ ml: 1 }}
                    onClick={handleOnClose}
                    variant={'outlined'}
                    color={'action'}>
                    关闭
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalViewCustomer;
