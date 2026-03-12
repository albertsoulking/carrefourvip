import { Box, Chip } from '@mui/material';

export default function RowParent({ value }) {
    return (
        <Box sx={{ width: '100%' }}>
            <Chip
                label={value ?? '-'}
                size={'small'}
                color={'info'}
                sx={{ cursor: 'pointer', fontSize: 12 }}
                onClick={() => {}}
            />
        </Box>
    );
}
