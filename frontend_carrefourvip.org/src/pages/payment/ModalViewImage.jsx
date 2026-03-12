import { CloseRounded } from '@mui/icons-material';
import { Dialog, IconButton } from '@mui/material';

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
            <img
                src={`${
                    import.meta.env.VITE_API_BASE_URL
                }/uploads/images/${image}`}
                alt={'Preview'}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    backgroundColor: '#000',
                    cursor: 'pointer'
                }}
                onClick={() => setOpen(false)}
            />
        </Dialog>
    );
};

export default ModalViewImage;
