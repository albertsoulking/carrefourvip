import { PasswordRounded } from '@mui/icons-material';
import { Box } from '@mui/material';

const RowActions = ({ data }) => {
 
    return (
        <Box>
            <Button
                color={'action'}
                startIcon={<PasswordRounded fontSize={'inherit'} />}
                size={'small'}
                sx={{ fontSize: 12, p: 0 }}
                onClick={() => {}}>
                更改密码
            </Button>
        </Box>
    );
};

export default RowActions;
