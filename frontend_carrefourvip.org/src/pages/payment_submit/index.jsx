import { Box, Typography, Button } from '@mui/material';
import web from '../../routes/web';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

export default function PaymentSubmitPage() {
    const navigate = useSmartNavigate();

    return (
        <Box
            textAlign={'center'}
            mt={10}>
            <AccessTimeIcon
                color={'action'}
                sx={{ mt: 10, fontSize: 80 }}
            />
            <Typography
                variant={'h4'}
                mt={2}>
                Operation Completed
            </Typography>
            <Typography
                variant={'body1'}
                mt={1}
                p={1}>
                Hello, your order has been submitted and payment has been
                completed. We will arrange delivery of your product after
                confirming your payment.
                <br /> Please check the [<strong>Carrefour</strong>] order
                details page for delivery progress.
            </Typography>
            <Button
                variant={'contained'}
                color={'primary'}
                sx={{ mt: 4 }}
                onClick={() => navigate(web.home)}>
                Back to Home
            </Button>
        </Box>
    );
}
