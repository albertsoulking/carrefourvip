import { useRef, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    Divider,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    InputAdornment,
    Avatar,
    IconButton,
    Box
} from '@mui/material';
import {
    CategoryRounded,
    DeleteRounded,
    UploadRounded
} from '@mui/icons-material';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

const ModalCreate = ({ open, setOpen }) => {
    const items = [
        {
            name: 'name',
            label: '名称'
        }
    ];
    const [formData, setFormData] = useState({});
    const [file, setFile] = useState(null);
    const [fileBg, setFileBg] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewBgUrl, setPreviewBgUrl] = useState('');
    const inputRef = useRef();
    const inputBgRef = useRef();

    const handleOnClose = () => {
        setOpen(false);
        setFormData({});
        setFile(null);
        setFileBg(null);
        setPreviewUrl('');
        setPreviewBgUrl('');
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value ?? ''
        });
    };

    // Handle create team submission
    const handleCreateSubmit = async () => {
        let imageUrl = null;
        let bgImageUrl = null;

        if (file && file instanceof File) {
            const imageFile = new FormData();
            imageFile.append('file', file, file.name);

            const imgRes = await api.utilities.upload(imageFile);
            imageUrl = imgRes.data.name;
        }

        if (fileBg && fileBg instanceof File) {
            const imageFile = new FormData();
            imageFile.append('file', fileBg, fileBg.name);

            const imgRes = await api.utilities.upload(imageFile);
            bgImageUrl = imgRes.data.name;
        }

        const payload = {
            ...formData,
            imageUrl,
            bgImageUrl
        };

        try {
            await api.category.create(payload);
            setOpen(false);
            setFormData({});
            setFile(null);
            setFileBg(null);
            setPreviewUrl('');
            setPreviewBgUrl('');
            enqueueSnackbar('创建分类成功!', {
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
            onClose={handleOnClose}
            maxWidth={'sm'}
            fullWidth
            container={document.body}
            disablePortal={false}
            aria-labelledby={'create-category-dialog-title'}>
            <DialogTitle
                id={'create-category-dialog-title'}
                sx={{
                    pb: 1,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiSvgIcon-root': { mr: 1 }
                }}>
                <CategoryRounded color={'primary'} /> 添加新分类
            </DialogTitle>
            <DialogContent dividers>
                {items.map((item) => (
                    <Grid
                        size={{ xs: 12 }}
                        key={item.name}>
                        {item.children ? (
                            <FormControl
                                margin={'normal'}
                                fullWidth>
                                <InputLabel>{item.label}</InputLabel>
                                <Select
                                    {...item}
                                    value={formData[item.name] || ''}
                                    onChange={handleInputChange}>
                                    <MenuItem
                                        value={''}
                                        key={0}>
                                        全部
                                    </MenuItem>
                                    {item.children.map((child) => (
                                        <MenuItem
                                            value={child.value}
                                            key={child.value}>
                                            {child.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <TextField
                                {...item}
                                value={formData[item.name] || ''}
                                onChange={handleInputChange}
                                fullWidth
                                required
                                margin={'normal'}
                            />
                        )}
                    </Grid>
                ))}
                <Box
                    display={'flex'}
                    alignItems={'center'}
                    gap={1}>
                    {/* Hidden File Input */}
                    <input
                        ref={inputRef}
                        type={'file'}
                        accept={'image/*'}
                        onChange={(e) => {
                            const uploadedFile = e.target.files?.[0];
                            if (uploadedFile) {
                                setFile(uploadedFile);
                                setPreviewUrl(
                                    URL.createObjectURL(uploadedFile)
                                );
                            }
                        }}
                        style={{ display: 'none' }}
                    />
                    {/* Fake TextField */}
                    <TextField
                        fullWidth
                        margin={'normal'}
                        label={'上传图片'}
                        value={file?.name || ''}
                        placeholder={'选择图片'}
                        InputProps={{
                            readOnly: true,
                            startAdornment: previewUrl && (
                                <InputAdornment position={'start'}>
                                    <Avatar
                                        src={previewUrl}
                                        variant={'rounded'}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            mr: 1
                                        }}
                                    />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position={'end'}>
                                    {file && (
                                        <IconButton
                                            onClick={() => {
                                                setFile(null);
                                                setPreviewUrl('');
                                                inputRef.current.value = '';
                                            }}>
                                            <DeleteRounded />
                                        </IconButton>
                                    )}
                                    <IconButton
                                        onClick={() =>
                                            inputRef.current.click()
                                        }>
                                        <UploadRounded />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
                <Box
                    display={'flex'}
                    alignItems={'center'}
                    gap={1}>
                    {/* Hidden File Input */}
                    <input
                        ref={inputBgRef}
                        type={'file'}
                        accept={'image/*'}
                        onChange={(e) => {
                            const uploadedFile = e.target.files?.[0];
                            if (uploadedFile) {
                                setFileBg(uploadedFile);
                                setPreviewBgUrl(
                                    URL.createObjectURL(uploadedFile)
                                );
                            }
                        }}
                        style={{ display: 'none' }}
                    />
                    {/* Fake TextField */}
                    <TextField
                        fullWidth
                        margin={'normal'}
                        label={'上传背景图片'}
                        value={fileBg?.name || ''}
                        placeholder={'选择背景图片'}
                        InputProps={{
                            readOnly: true,
                            startAdornment: previewBgUrl && (
                                <InputAdornment position={'start'}>
                                    <Avatar
                                        src={previewBgUrl}
                                        variant={'rounded'}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            mr: 1
                                        }}
                                    />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position={'end'}>
                                    {fileBg && (
                                        <IconButton
                                            onClick={() => {
                                                setFileBg(null);
                                                setPreviewBgUrl('');
                                                inputBgRef.current.value = '';
                                            }}>
                                            <DeleteRounded />
                                        </IconButton>
                                    )}
                                    <IconButton
                                        onClick={() =>
                                            inputBgRef.current.click()
                                        }>
                                        <UploadRounded />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={handleOnClose}
                    variant={'outlined'}
                    color={'error'}
                    sx={{ width: 100 }}>
                    取消
                </Button>
                <Button
                    onClick={handleCreateSubmit}
                    variant={'contained'}
                    color={'primary'}
                    sx={{ width: 100 }}>
                    创建
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalCreate;
