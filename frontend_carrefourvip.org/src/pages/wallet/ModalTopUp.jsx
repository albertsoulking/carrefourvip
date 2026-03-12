import {
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton
} from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import { useState } from 'react';

const ModalTopUp = ({ open, setOpen }) => {
    const [amount, setAmount] = useState('');

    const handleOnClose = () => {
        setAmount('');
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            onClose={handleOnClose}>
            <DialogTitle>Top Up</DialogTitle>
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
                    label={'Amount'}
                    helperText={'* Minimum amount 10 EUR *'}
                    size={'small'}
                    fullWidth
                    onChange={(e) => setAmount(e.target.value)}
                />
                
            </DialogContent>
        </Dialog>
    );
};

export default ModalTopUp;
