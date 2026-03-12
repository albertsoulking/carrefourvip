import {
    Box,
    Typography,
    Card,
    CardContent,
    Switch,
    IconButton
} from '@mui/material';
import { EditRounded, DeleteRounded } from '@mui/icons-material';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

const MessageItem = ({ data, setOpenEdit, setOpenDelete, loadData }) => {
    const handleOnChange = async (checked, id) => {
        const payload = {
            id,
            isPrimary: checked
        };

        try {
            await api.locations.updateOne(payload);
            loadData();
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
                m: 1,
                borderRadius: 2,
                boxShadow: 'rgba(0, 0, 0, 0.1) 0 4px 12px'
            }}>
            <CardContent sx={{ p: 1 }}>
                <Box
                    display={'flex'}
                    alignItems={'center'}
                    justifyContent={'space-between'}>
                    <Switch
                        size={'small'}
                        checked={Boolean(data.isPrimary)}
                        sx={{ verticalAlign: 'text-top' }}
                        onChange={(e) =>
                            handleOnChange(e.target.checked, data.id)
                        }
                    />
                    <Box>
                        <IconButton
                            size={'small'}
                            onClick={() => setOpenEdit({ open: true, data })}>
                            <EditRounded
                                fontSize={'small'}
                                color={'primary'}
                            />
                        </IconButton>
                        <IconButton
                            size={'small'}
                            onClick={() => setOpenDelete({ open: true, data })}>
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
                        Name:{' '}
                        <span
                            translate={'no'}
                            style={{ fontWeight: 'bold' }}>
                            {data?.receiverName}
                        </span>
                    </Typography>
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

export default MessageItem;
