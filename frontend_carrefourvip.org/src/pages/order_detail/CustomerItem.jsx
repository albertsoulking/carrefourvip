import { Box, Button } from '@mui/material';
import web from '../../routes/web';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { SupportAgentRounded } from '@mui/icons-material';

const CustomerItem = () => {
    const navigate = useSmartNavigate();

    return (
        <Box mb={2}>
            <Button
                startIcon={<SupportAgentRounded />}
                variant={'outlined'}
                fullWidth
                onClick={() => navigate(web.messages)}>
                Contact Us
            </Button>
        </Box>
    );
};

export default CustomerItem;
