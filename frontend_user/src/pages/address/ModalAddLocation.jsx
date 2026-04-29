import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Box,
    TextField,
    Button,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../routes/api';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const ModalAddLocation = ({ open, loadData, setOpen }) => {
    const { t } = useTranslation();
    const fields = [
        { label: t('address.fields.receiverName'), value: '' },
        { label: t('address.fields.receiverPhone'), value: '' },
        { label: t('address.fields.zipCode'), value: '' },
        { label: t('address.fields.addressLine'), value: '' },
        { label: t('address.fields.cityRegion'), value: '' },
        { label: t('address.fields.stateProvince'), value: '' },
        { label: t('address.fields.country'), value: '' }
    ];

    const [formData, setFormData] = useState(fields);

    const handleOnChange = (event, index) => {
        setFormData((prev) => {
            const next = [...prev];
            next[index].value = event.target.value;
            return next;
        });
    };

    const handleOnAddClick = async () => {
        const payload = {
            receiverName: formData[0].value.trim(),
            receiverMobile: formData[1].value.trim(),
            postalCode: formData[2].value.trim(),
            address: formData[3].value.trim(),
            city: formData[4].value.trim(),
            state: formData[5].value.trim(),
            country: formData[6].value.trim()
        };

        try {
            await api.locations.createOne(payload);
            loadData();
            setOpen(false);
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
            fullWidth
            PaperProps={{
                sx: {
                    m: 1.5,
                    maxHeight: 'calc(100vh - 24px)',
                    bgcolor: 'var(--brand-paper)'
                }
            }}>
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2.5,
                    py: 1.75,
                    borderBottom: '1px solid var(--brand-line)'
                }}>
                <Box>
                    <Typography
                        fontSize={18}
                        fontWeight={800}
                        color={'var(--brand-ink)'}>
                        {t('address.addTitle')}
                    </Typography>
                    <Typography
                        fontSize={12}
                        color={'var(--brand-muted)'}>
                        Add a delivery location for checkout.
                    </Typography>
                </Box>
                <IconButton
                    sx={{
                        border: '1px solid var(--brand-line)',
                        bgcolor: 'var(--brand-paper)'
                    }}
                    onClick={() => setOpen(false)}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ px: 2.5, py: 2 }}>
                <Box
                    component={'form'}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 1.5,
                        pt: 0.5
                    }}>
                    {formData.map((item, index) => (
                        <TextField
                            key={index}
                            size={'small'}
                            label={item.label}
                            fullWidth
                            value={item.value}
                            InputProps={{
                                sx: {
                                    fontSize: 16,
                                    bgcolor: 'var(--brand-paper)'
                                }
                            }}
                            sx={{
                                gridColumn:
                                    index === 3 ? '1 / -1' : 'auto'
                            }}
                            onChange={(event) => handleOnChange(event, index)}
                        />
                    ))}
                </Box>
            </DialogContent>
            <DialogActions
                sx={{
                    px: 2.5,
                    py: 1.5,
                    borderTop: '1px solid var(--brand-line)'
                }}>
                <Button
                    variant={'outlined'}
                    onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button
                    variant={'contained'}
                    sx={{
                        minWidth: 120,
                        textTransform: 'capitalize'
                    }}
                    onClick={handleOnAddClick}>
                    {t('common.add')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalAddLocation;
