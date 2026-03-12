import {
    Card,
    Typography,
    Box,
    Switch,
    IconButton,
    CardContent
} from '@mui/material';
import api from '../../routes/api';
import { DeleteRounded, EditRounded } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';

const CardLocation = ({
    data = [],
    loadData,
    setOpen,
    setOpenDrawer,
    setSelectAddress,
    setOpenEdit,
    setOpenDelete
}) => {
    const handleOnChange = async (checked, id) => {
        const payload = {
            id,
            isPrimary: checked
        };

        try {
            await api.locations.updateOne(payload);
            loadData();
            setOpen({ open: false, data: null });
        } catch (error) {
            enqueueSnackbar(
                Array.isArray(error.response?.data?.message)
                    ? error.response.data.message[0]
                    : error.response?.data?.message || error.message,
                {
                    variant: 'error'
                }
            );
        }
    };

    return (
        <Card
            sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 2,
                boxShadow: 'rgba(0, 0, 0, 0.1) 0 4px 12px'
            }}>
            <CardContent
                sx={{ p: 1 }}
                onClick={() => {
                    setOpenDrawer(false);
                    setSelectAddress(data?.id);
                }}>
                <Box
                    display={'flex'}
                    alignItems={'center'}
                    justifyContent={'space-between'}>
                    <Typography
                        variant='h6'
                        fontWeight={'bold'}
                        mr={1}
                        translate={'no'}>
                        {data?.receiverName}
                    </Typography>
                    <Box
                        display={'flex'}
                        alignItems={'center'}>
                        <Switch
                            size={'small'}
                            checked={Boolean(data.isPrimary)}
                            sx={{ verticalAlign: 'text-top' }}
                            onChange={(e) => {
                                e.stopPropagation();
                                handleOnChange(e.target.checked, data.id);
                            }}
                        />
                        <IconButton
                            size={'small'}
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenEdit({ open: true, data });
                            }}>
                            <EditRounded
                                fontSize={'small'}
                                color={'primary'}
                            />
                        </IconButton>
                        <IconButton
                            size={'small'}
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenDelete({ open: true, data });
                            }}>
                            <DeleteRounded
                                fontSize={'small'}
                                color={'error'}
                            />
                        </IconButton>
                    </Box>
                </Box>
                <Box>
                    <Typography
                        variant={'subtitle2'}
                        noWrap>
                        Phone:{' '}
                        <span translate={'no'}>{data?.receiverMobile}</span>
                    </Typography>
                    <Typography
                        variant={'subtitle2'}
                        noWrap>
                        Address:{' '}
                        <span translate={'no'}>
                            {data.address}, {data.city}, {data.state},{' '}
                            {data.country}
                        </span>
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CardLocation;
