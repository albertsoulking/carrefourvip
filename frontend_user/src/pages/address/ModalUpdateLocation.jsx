import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    TextField,
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../routes/api';
import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const ModalUpdateLocation = ({ open, data = [], setOpen, loadData }) => {
    const { t } = useTranslation();
    const fields = [
        { label: t('address.fields.receiverName'), value: data?.receiverName ?? '' },
        { label: t('address.fields.receiverPhone'), value: data?.receiverMobile ?? '' },
        { label: t('address.fields.zipCode'), value: data?.postalCode ?? '' },
        { label: t('address.fields.addressLine'), value: data?.address ?? '' },
        { label: t('address.fields.cityRegion'), value: data?.city ?? '' },
        { label: t('address.fields.stateProvince'), value: data?.state ?? '' },
        { label: t('address.fields.country'), value: data?.country ?? '' }
    ];

    useEffect(() => {
        setFormData(fields);
    }, [open]);

    const [formData, setFormData] = useState(fields);

    const handleOnChange = (event, index) => {
        setFormData((prev) => {
            const next = [...prev];
            next[index].value = event.target.value;
            return next;
        });
    };

    const handleOnUpdateClick = async () => {
        const payload = {
            id: data?.id,
            receiverName: formData[0].value.trim(),
            receiverMobile: formData[1].value.trim(),
            postalCode: formData[2].value.trim(),
            address: formData[3].value.trim(),
            city: formData[4].value.trim(),
            state: formData[5].value.trim(),
            country: formData[6].value.trim()
        };

        try {
            await api.locations.updateOne(payload);
            loadData();
            setOpen({ open: false, data: null });
            setFormData(fields);
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
        <Dialog
            open={open}
            maxWidth={'sm'}
            fullWidth>
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 0
                }}>
                <span>{t('address.editTitle')}</span>
                <IconButton
                    color={'error'}
                    onClick={() => setOpen({ open: false, data: null })}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pb: 0 }}>
                <Box
                    component={'form'}
                    sx={{ pt: 2 }}>
                    {formData.map((item, index) => (
                        <TextField
                            key={index}
                            size={'small'}
                            label={item.label}
                            fullWidth
                            value={item.value}
                            InputProps={{
                                sx: {
                                    fontSize: 18
                                }
                            }}
                            sx={{ borderRadius: 4, mb: 2 }}
                            onChange={(event) => handleOnChange(event, index)}
                        />
                    ))}
                </Box>
                <Button
                    variant={'contained'}
                    fullWidth
                    sx={{
                        mb: 2,
                        textTransform: 'capitalize'
                    }}
                    onClick={handleOnUpdateClick}>
                    {t('common.update')}
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default ModalUpdateLocation;
