import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    Typography,
    Button,
    Box,
    IconButton
} from '@mui/material';
import { useState, useEffect } from 'react';
import api from '../../routes/api';
import { CloseRounded } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const ModalResultDetail = ({ open, data, setOpen, eventId }) => {
    const { t } = useTranslation();
    const [rewardId, setRewardId] = useState(null);

    useEffect(() => {
        if (!open) return;

        setResult();
        console.log(data);
    }, [open]);

    const setResult = async () => {
        const payload = {
            eventId,
            prizeId: data.index
        };

        const res = await api.event.setResult(payload);
        setRewardId(res.data.id);
    };

    const claimReward = async () => {
        const payload = {
            rewardId
        };

        await api.event.claimReward(payload);
        setOpen({ open: false, data: null });
        enqueueSnackbar(t('eventDetail.rewardReceived'), {
            variant: 'success'
        });
    };

    return (
        <Dialog
            open={open}
            fullWidth>
            <Box
                display={'flex'}
                justifyContent={'space-between'}>
                <DialogTitle>{t('eventDetail.resultTitle')}</DialogTitle>
                <IconButton
                    color={'error'}
                    onClick={() => setOpen({ open: false, data: null })}>
                    <CloseRounded />
                </IconButton>
            </Box>
            <DialogContent dividers>
                <DialogContentText
                    textAlign={'center'}
                    fontWeight={'bold'}
                    fontSize={20}>
                    {t('eventDetail.youWon')}
                </DialogContentText>
                <Typography
                    textAlign={'center'}
                    mt={2}
                    mb={1}>
                    {data?.fonts[0].text}
                </Typography>
            </DialogContent>
            <Box
                p={1}
                textAlign={'center'}>
                <Button
                    variant={'contained'}
                    sx={{ width: 150 }}
                    onClick={claimReward}>
                    {t('eventDetail.claim')}
                </Button>
            </Box>
        </Dialog>
    );
};

export default ModalResultDetail;
