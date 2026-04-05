import { CloudUploadRounded, DeleteRounded } from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

export default function ModalBanner({ open, setOpen, data, loadData }) {
    const [imageList, setImageList] = useState([]);
    const [openImageViewer, setOpenImageViewer] = useState({
        open: false,
        data: null
    });
    const [hover, setHover] = useState(-1);

    useEffect(() => {
        if (!open) return;
        const banners = data.homepageBanner?.split(',') || [];
        setImageList(banners.filter(Boolean));
    }, [open]);

    const onSave = async () => {
        try {
            const payload = {
                group: 'setting',
                key: 'website',
                value: JSON.stringify({
                    ...data,
                    homepageBanner: imageList.filter(Boolean).join(',')
                })
            };

            await api.settings.update(payload);
            loadData();
            enqueueSnackbar('已更新首页横幅!', {
                variant: 'success'
            });
        } catch (error) {
            enqueueSnackbar(
                Array.isArray(error.response?.data?.message)
                    ? error.response.data.message[0]
                    : error.response?.data?.message || error.message,
                {
                    variant: 'error'
                }
            );
        }
    };

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth={'md'}>
            <DialogTitle>添加首页横幅</DialogTitle>
            <DialogContent dividers>
                <Button
                    component={'label'}
                    role={undefined}
                    variant={'outlined'}
                    tabIndex={-1}
                    startIcon={<CloudUploadRounded />}
                    size={'small'}
                    sx={{ mt: 1 }}
                    fullWidth>
                    上传横幅背景图片
                    <input
                        type={'file'}
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file && file instanceof File) return;

                            const imageData = new FormData();
                            imageData.append('file', file);

                            const res = await api.utilities.upload(imageData);
                            setImageList((prev) => [...prev, res.data.name]);
                        }}
                        style={{
                            clip: 'rect(0 0 0 0)',
                            clipPath: 'inset(50%)',
                            height: 1,
                            overflow: 'hidden',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            whiteSpace: 'nowrap',
                            width: 1
                        }}
                    />
                </Button>
                <Box
                    display={'flex'}
                    flexWrap={'wrap'}
                    mt={2}
                    gap={1}>
                    {imageList.map((img, index) => (
                        <Box
                            key={index}
                            onMouseEnter={() => setHover(index)}
                            onMouseLeave={() => setHover(-1)}
                            position={'relative'}>
                            {hover === index && (
                                <IconButton
                                    color={'error'}
                                    sx={{
                                        position: 'absolute',
                                        zIndex: 1,
                                        top: 0,
                                        right: 0
                                    }}
                                    onClick={() => {
                                        setImageList((prev) =>
                                            prev.filter(
                                                (_, idx) => idx !== index
                                            )
                                        );
                                    }}>
                                    <DeleteRounded />
                                </IconButton>
                            )}

                            <Avatar
                                variant={'rounded'}
                                sx={{
                                    width: 160,
                                    height: 100,
                                    border: '1px solid #0000001a',
                                    cursor: 'pointer'
                                }}
                                onClick={() =>
                                    setOpenImageViewer({
                                        open: true,
                                        data: img
                                    })
                                }
                                src={`${
                                    import.meta.env.VITE_API_BASE_URL
                                }/uploads/thumbs/${img}`}
                            />
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => setOpen(false)}
                    variant={'outlined'}
                    color={'default'}
                    sx={{ width: 100 }}>
                    关闭
                </Button>
                <Button
                    onClick={onSave}
                    variant={'contained'}
                    sx={{ width: 100 }}>
                    保存
                </Button>
            </DialogActions>
            <Dialog
                open={openImageViewer.open}
                onClose={() =>
                    setOpenImageViewer({
                        open: false,
                        data: null
                    })
                }>
                <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/uploads/images/${
                        openImageViewer.data
                    }`}
                    alt={openImageViewer.data}
                    style={{ objectFit: 'contain', borderRadius: 4 }}
                />
            </Dialog>
        </Dialog>
    );
}
