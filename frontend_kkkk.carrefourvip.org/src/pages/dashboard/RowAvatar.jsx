import { useState } from 'react';
import { Avatar, Dialog } from '@mui/material';

const RowAvatar = ({ imageUrl }) => {
    const [loaded, setLoaded] = useState(false);
    const [openImageViewer, setOpenImageViewer] = useState(false);

    return (
        <>
            <Avatar
                variant={'rounded'}
                src={`${
                    import.meta.env.VITE_API_BASE_URL
                }/uploads/thumbs/${imageUrl}`}
                sx={{
                    width: 30,
                    height: 30,
                    cursor: 'pointer',
                    opacity: loaded ? 1 : 0.5,
                    transition: '0.6s ease'
                }}
                onLoad={() => setLoaded(true)}
                onClick={() => setOpenImageViewer(Boolean(imageUrl))}
            />
            <Dialog
                open={openImageViewer}
                onClose={() => setOpenImageViewer(false)}>
                <img
                    src={`${
                        import.meta.env.VITE_API_BASE_URL
                    }/uploads/images/${imageUrl}`}
                    alt={imageUrl}
                    style={{ objectFit: 'contain', borderRadius: 4 }}
                />
            </Dialog>
        </>
    );
};

export default RowAvatar;
