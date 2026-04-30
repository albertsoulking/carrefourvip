import { CloseRounded } from '@mui/icons-material';
import { Box, Dialog, IconButton } from '@mui/material';

const ModalViewImage = ({ image, open, setOpen }) => {
    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            fullScreen>
            <IconButton
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#fff',
                    transition: '0.2s linear',
                    bgcolor: '#00000070',
                    ':hover': { bgcolor: '#00000070' }
                }}
                onClick={() => setOpen(false)}>
                <CloseRounded />
            </IconButton>
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: '#000',
                    cursor: 'zoom-out',
                    p: 1
                }}
                onClick={() => setOpen(false)}>
                {image ? (
                    <img
                        src={`${
                            import.meta.env.VITE_API_BASE_URL
                        }/uploads/images/${image}`}
                        alt={'Preview'}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                        }}
                    />
                ) : null}
            </Box>
        </Dialog>
    );
};

export default ModalViewImage;
