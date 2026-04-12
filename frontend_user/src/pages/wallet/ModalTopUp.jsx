import {
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton
} from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ModalTopUp = ({ open, setOpen }) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');

    const handleOnClose = () => {
        setAmount('');
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleOnClose}>
            <DialogTitle>{t('wallet.topUp.title')}</DialogTitle>
            <IconButton
                sx={{ position: 'absolute', right: 5, top: 5 }}
                onClick={handleOnClose}>
                <CloseRounded />
            </IconButton>
            <DialogContent>
                <TextField
                    value={amount}
                    sx={{ mb: 2 }}
                    type={'number'}
                    label={t('wallet.topUp.amount')}
                    helperText={t('wallet.topUp.minimumAmount')}
                    size={'small'}
                    fullWidth
                    onChange={(e) => setAmount(e.target.value)}
                />
                
            </DialogContent>
        </Dialog>
    );
};

export default ModalTopUp;
