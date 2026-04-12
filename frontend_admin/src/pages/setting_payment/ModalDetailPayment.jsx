import {
    AddRounded,
    CloudUploadRounded,
    DeleteRounded
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const ModalDetailPayment = ({ open, data, setOpen, loadData, searchModal }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({});
    const [imageList, setImageList] = useState([]);
    const [noteList, setNoteList] = useState([]);
    const [noticeList, setNoticeList] = useState([]);
    const [exLogoList, setExLogoList] = useState([]);

    const textColor = [
        {
            label: t('settingPayment.colors.red'),
            value: 'error'
        },
        {
            label: t('settingPayment.colors.blue'),
            value: 'primary'
        },
        {
            label: t('settingPayment.colors.orange'),
            value: 'warning'
        },
        {
            label: t('settingPayment.colors.purple'),
            value: 'secondary'
        },
        {
            label: t('settingPayment.colors.green'),
            value: 'success'
        },
        {
            label: t('settingPayment.colors.cyan'),
            value: 'info'
        },
        {
            label: t('settingPayment.colors.gray'),
            value: 'textDisabled'
        }
    ];

    useEffect(() => {
        setFormData(data ?? {});
        setExLogoList(data?.exLogos ? data.exLogos.split(',') : []);
        setImageList(data?.images ? data.images.split(',') : []);
        setNoteList(data?.notes ? JSON.parse(data.notes) : []);
        setNoticeList(data?.notices ? JSON.parse(data.notices) : []);
    }, [open]);

    const handleOnSave = async () => {
        try {
            const payload = {
                id: formData.id,
                logo: formData.logo,
                name: formData.name,
                images: imageList.filter(Boolean).join(','),
                exLogos: exLogoList.filter(Boolean).join(','),
                notes: JSON.stringify(noteList),
                notices: JSON.stringify(noticeList),
                blackList: formData.blackList
            };

            await api.gateway.update(payload);
            loadData(searchModal);
            setOpen({ open: false, data: null });
            setImageList([]);
            setNoteList([]);
            setNoticeList([]);

            enqueueSnackbar(t('settingPayment.snackbar.updated'), {
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

    const handleInputChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value ?? ''
        });
    };

    return (
        <Dialog
            open={open}
            maxWidth={'sm'}
            fullWidth
            container={document.body}
            disablePortal={false}>
            <DialogTitle>{t('settingPayment.modalDetail.title')}</DialogTitle>
            <DialogContent dividers>
                <Box
                    display={'flex'}
                    gap={1}>
                    <Box>
                        <Avatar
                            variant={'rounded'}
                            sx={{
                                width: 160,
                                height: 160,
                                border: '1px solid #0000001a'
                            }}
                            src={`${
                                import.meta.env.VITE_API_BASE_URL
                            }/uploads/images/${formData.logo}`}
                        />
                        <Button
                            component={'label'}
                            role={undefined}
                            variant={'outlined'}
                            tabIndex={-1}
                            startIcon={<CloudUploadRounded />}
                            size={'small'}
                            sx={{ mt: 1 }}
                            fullWidth>
                            {t('settingPayment.modalDetail.uploadNewLogo')}
                            <input
                                type={'file'}
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file && file instanceof File) return;

                                    const imageData = new FormData();
                                    imageData.append('file', file);

                                    const res = await api.utilities.upload(
                                        imageData
                                    );
                                    handleInputChange('logo', res.data.name);
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
                    </Box>
                    <Box>
                        <TextField
                            name={'name'}
                            label={t('table.name')}
                            value={formData?.name || ''}
                            fullWidth
                            margin={'dense'}
                            size={'small'}
                            onChange={(e) =>
                                handleInputChange('name', e.target.value)
                            }
                        />
                        <TextField
                            name={'code'}
                            label={t('settingPayment.fields.code')}
                            value={formData?.provider?.code || ''}
                            fullWidth
                            margin={'dense'}
                            size={'small'}
                            disabled
                        />
                        <TextField
                            name={'provider'}
                            label={t('settingPayment.fields.provider')}
                            value={formData?.provider?.name || ''}
                            fullWidth
                            margin={'dense'}
                            size={'small'}
                            disabled
                        />
                    </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography
                    fontSize={12}
                    mb={1}>
                    {t('settingPayment.modalDetail.sideImages')}
                </Typography>
                <Box
                    display={'flex'}
                    flexWrap={'wrap'}>
                    {imageList.map((img, index) => (
                        <Box key={index}>
                            <input
                                accept={'image/*'}
                                id={`logo-${index}`}
                                type={'file'}
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file && file instanceof File) return;

                                    const imageData = new FormData();
                                    imageData.append('file', file);

                                    const res = await api.utilities.upload(
                                        imageData
                                    );
                                    const newList = [...imageList];
                                    newList[index] = res.data.name;
                                    setImageList(newList);
                                }}
                            />
                            <label
                                htmlFor={`logo-${index}`}
                                style={{
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}>
                                <Avatar
                                    variant={'rounded'}
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        border: '1px solid #0000001a',
                                        mr: 1,
                                        mb: 1
                                    }}
                                    src={`${
                                        import.meta.env.VITE_API_BASE_URL
                                    }/uploads/images/${img}`}
                                />
                                {img && (
                                    <Button
                                        variant={'contained'}
                                        color={'error'}
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            minWidth: 0,
                                            position: 'absolute',
                                            top: 0,
                                            opacity: 0,
                                            transition: '.3s ease',
                                            ':hover': { opacity: 1 }
                                        }}
                                        onClick={() =>
                                            setImageList((prev) =>
                                                prev.filter(
                                                    (_, i) => i !== index
                                                )
                                            )
                                        }>
                                        <DeleteRounded />
                                    </Button>
                                )}
                            </label>
                        </Box>
                    ))}
                    <Button
                        variant={'outlined'}
                        sx={{ width: 60, height: 60, minWidth: 0, mb: 1 }}
                        onClick={() => setImageList((prev) => [...prev, ''])}>
                        <AddRounded />
                    </Button>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography
                    fontSize={12}
                    mb={1}>
                    {t('settingPayment.modalDetail.noticeImages')}
                </Typography>
                <Box
                    display={'flex'}
                    flexWrap={'wrap'}>
                    {exLogoList.map((img, index) => (
                        <Box key={index}>
                            <input
                                accept={'image/*'}
                                id={`img-${index}`}
                                type={'file'}
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file && file instanceof File) return;

                                    const imageData = new FormData();
                                    imageData.append('file', file);

                                    const res = await api.utilities.upload(
                                        imageData
                                    );
                                    const newList = [...exLogoList];
                                    newList[index] = res.data.name;
                                    setExLogoList(newList);
                                }}
                            />
                            <label
                                htmlFor={`img-${index}`}
                                style={{
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}>
                                <Avatar
                                    variant={'rounded'}
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        border: '1px solid #0000001a',
                                        mr: 1,
                                        mb: 1
                                    }}
                                    src={`${
                                        import.meta.env.VITE_API_BASE_URL
                                    }/uploads/images/${img}`}
                                />
                                {img && (
                                    <Button
                                        variant={'contained'}
                                        color={'error'}
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            minWidth: 0,
                                            position: 'absolute',
                                            top: 0,
                                            opacity: 0,
                                            transition: '.3s ease',
                                            ':hover': { opacity: 1 }
                                        }}
                                        onClick={() =>
                                            setExLogoList((prev) =>
                                                prev.filter(
                                                    (_, i) => i !== index
                                                )
                                            )
                                        }>
                                        <DeleteRounded />
                                    </Button>
                                )}
                            </label>
                        </Box>
                    ))}
                    <Button
                        variant={'outlined'}
                        sx={{ width: 60, height: 60, minWidth: 0, mb: 1 }}
                        onClick={() => setExLogoList((prev) => [...prev, ''])}>
                        <AddRounded />
                    </Button>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography
                    fontSize={12}
                    mb={1}>
                    {t('settingPayment.modalDetail.notes')}
                </Typography>
                {noteList.map((note, index) => (
                    <Box
                        key={index}
                        display={'flex'}
                        gap={1}
                        mt={2}>
                        <FormControl
                            fullWidth
                            size={'small'}>
                            <InputLabel>{t('settingPayment.fields.color')}</InputLabel>
                            <Select
                                name={'type'}
                                label={t('settingPayment.fields.color')}
                                value={note.color || ''}
                                onChange={(e) => {
                                    const newList = [...noteList];
                                    newList[index].color = e.target.value;
                                    setNoteList(newList);
                                }}>
                                {textColor.map((txt) => (
                                    <MenuItem
                                        key={txt.value}
                                        value={txt.value}>
                                        {txt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            name={'text'}
                            label={t('settingPayment.fields.text')}
                            value={note.text || ''}
                            fullWidth
                            size={'small'}
                            onChange={(e) => {
                                const newList = [...noteList];
                                newList[index].text = e.target.value;
                                setNoteList(newList);
                            }}
                        />
                        <FormControl
                            fullWidth
                            size={'small'}>
                            <InputLabel>{t('settingPayment.fields.visible')}</InputLabel>
                            <Select
                                name={'visible'}
                                label={t('settingPayment.fields.visible')}
                                value={note.visible || ''}
                                onChange={(e) => {
                                    const newList = [...noteList];
                                    newList[index].visible = e.target.value;
                                    setNoteList(newList);
                                }}>
                                <MenuItem value={0}>{t('common.no')}</MenuItem>
                                <MenuItem value={1}>{t('common.yes')}</MenuItem>
                            </Select>
                        </FormControl>
                        <IconButton
                            onClick={() =>
                                setNoteList((prev) =>
                                    prev.filter((_, i) => i !== index)
                                )
                            }>
                            <DeleteRounded />
                        </IconButton>
                    </Box>
                ))}
                <Button
                    variant={'outlined'}
                    size={'small'}
                    startIcon={<AddRounded />}
                    sx={{ mt: 2 }}
                    onClick={() =>
                        setNoteList((prev) => [
                            ...prev,
                            { text: '', color: 'error', visible: 1 }
                        ])
                    }>
                    {t('common.add')}
                </Button>
                <Divider sx={{ my: 2 }} />
                <Typography
                    fontSize={12}
                    mb={1}>
                    {t('settingPayment.modalDetail.notices')}
                </Typography>
                {noticeList.map((notice, index) => (
                    <Box
                        key={index}
                        display={'flex'}
                        gap={1}
                        mt={2}>
                        <FormControl
                            fullWidth
                            size={'small'}>
                            <InputLabel>{t('settingPayment.fields.color')}</InputLabel>
                            <Select
                                name={'type'}
                                label={t('settingPayment.fields.color')}
                                value={notice.color || ''}
                                onChange={(e) => {
                                    const newList = [...noticeList];
                                    newList[index].color = e.target.value;
                                    setNoticeList(newList);
                                }}>
                                {textColor.map((txt) => (
                                    <MenuItem
                                        key={txt.value}
                                        value={txt.value}>
                                        {txt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            name={'text'}
                            label={t('settingPayment.fields.text')}
                            value={notice.text || ''}
                            fullWidth
                            size={'small'}
                            onChange={(e) => {
                                const newList = [...noticeList];
                                newList[index].text = e.target.value;
                                setNoticeList(newList);
                            }}
                        />
                        <FormControl
                            fullWidth
                            size={'small'}>
                            <InputLabel>{t('settingPayment.fields.visible')}</InputLabel>
                            <Select
                                name={'visible'}
                                label={t('settingPayment.fields.visible')}
                                value={notice.visible || ''}
                                onChange={(e) => {
                                    const newList = [...noticeList];
                                    newList[index].visible = e.target.value;
                                    setNoticeList(newList);
                                }}>
                                <MenuItem value={0}>{t('common.no')}</MenuItem>
                                <MenuItem value={1}>{t('common.yes')}</MenuItem>
                            </Select>
                        </FormControl>
                        <IconButton
                            onClick={() =>
                                setNoticeList((prev) =>
                                    prev.filter((_, i) => i !== index)
                                )
                            }>
                            <DeleteRounded />
                        </IconButton>
                    </Box>
                ))}
                <Button
                    variant={'outlined'}
                    size={'small'}
                    startIcon={<AddRounded />}
                    sx={{ mt: 2 }}
                    onClick={() =>
                        setNoticeList((prev) => [
                            ...prev,
                            { text: '', color: 'error', visible: 1 }
                        ])
                    }>
                    {t('common.add')}
                </Button>
                <Divider sx={{ my: 2 }} />
                <Typography
                    fontSize={12}
                    mb={1}>
                    {t('settingPayment.fields.blacklist')}
                </Typography>
                <TextField
                    name={'blackList'}
                    label={t('settingPayment.fields.userIds')}
                    value={formData.blackList || ''}
                    fullWidth
                    size={'small'}
                    helperText={t('settingPayment.modalDetail.blacklistHelp')}
                    onChange={(e) =>
                        handleInputChange('blackList', e.target.value)
                    }
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        setOpen({ open: false, data: null });
                        setImageList([]);
                        setNoteList([]);
                        setNoticeList([]);
                    }}
                    variant={'outlined'}
                    color={'default'}
                    sx={{ width: 100 }}>
                    {t('common.close')}
                </Button>
                <Button
                    onClick={handleOnSave}
                    variant={'contained'}
                    color={'primary'}
                    sx={{ width: 100 }}>
                    {t('common.saveChanges')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalDetailPayment;
