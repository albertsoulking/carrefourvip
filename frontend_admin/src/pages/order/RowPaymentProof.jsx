import { useState } from 'react';
import { Avatar, Dialog } from '@mui/material';

/** Payment transfer proof stored as uploads/images filename */
export default function RowPaymentProof({ filename }) {
    const [loaded, setLoaded] = useState(false);
    const [openImageViewer, setOpenImageViewer] = useState(false);

    if (!filename) {
        return (
            <span style={{ fontSize: 12, color: '#999' }}>—</span>
        );
    }

    const base = import.meta.env.VITE_API_BASE_URL || '';

    return (
        <>
            <Avatar
                variant={'rounded'}
                src={`${base}/uploads/images/${filename}`}
                sx={{
                    width: 30,
                    height: 30,
                    cursor: 'pointer',
                    opacity: loaded ? 1 : 0.5,
                    transition: '0.6s ease'
                }}
                onLoad={() => setLoaded(true)}
                onClick={() => setOpenImageViewer(true)}
            />
            <Dialog
                open={openImageViewer}
                onClose={() => setOpenImageViewer(false)}>
                <img
                    src={`${base}/uploads/images/${filename}`}
                    alt={filename}
                    style={{ objectFit: 'contain', borderRadius: 4, maxWidth: '90vw' }}
                    onClick={() => setOpenImageViewer(false)}
                />
            </Dialog>
        </>
    );
}
