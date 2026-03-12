import { ContentCopyRounded } from '@mui/icons-material';
import {
    Box,
    CircularProgress,
    IconButton,
    InputAdornment,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';

export default function BehalfCheckout({ paymentLink }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(paymentLink);
        enqueueSnackbar('Share link copied!', {
            variant: 'primary'
        });
    };

    return (
        <Box sx={{ bgcolor: '#fafafa', borderRadius: 2, p: 2 }}>
            <TextField
                label={'Payment sharing link'}
                variant={'outlined'}
                fullWidth
                autoComplete={'off'}
                value={paymentLink || 'Generating...'}
                disabled
                InputProps={{
                    endAdornment: !paymentLink ? (
                        <InputAdornment position={'end'}>
                            <CircularProgress size={20} />
                        </InputAdornment>
                    ) : (
                        <InputAdornment position={'end'}>
                            <Tooltip title={'Copy'}>
                                <IconButton
                                    size={'small'}
                                    onClick={handleCopy}
                                    edge={'end'}>
                                    <ContentCopyRounded fontSize={'small'} />
                                </IconButton>
                            </Tooltip>
                        </InputAdornment>
                    )
                }}
                sx={{ my: 3 }}
            />
            <Typography
                textAlign={'center'}
                fontSize={12}>
                Copy and share with friends to make payment
            </Typography>
        </Box>
    );
}
