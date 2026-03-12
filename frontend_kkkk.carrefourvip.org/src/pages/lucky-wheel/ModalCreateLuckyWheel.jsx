import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    DialogActions,
    Button,
    Grid,
    Typography,
    IconButton
} from '@mui/material';
import { AddRounded, DeleteRounded, PersonRounded } from '@mui/icons-material';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

export default function ModalCreateLuckyWheel({
    open,
    setOpen,
    loadData,
    searchModal
}) {
    const items = [
        {
            name: 'name',
            label: '名称',
            required: true
        }
    ];
    const [prizes, setPrizes] = useState([
        {
            fonts: [{ text: '' }],
            background: '#e9e8fe',
            range: '',
            index: 0,
            type: ''
        },
        {
            fonts: [{ text: '' }],
            background: '#b8c5f2',
            range: '',
            index: 1,
            type: ''
        }
    ]);
    const [formData, setFormData] = useState({});

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value ?? ''
        });
    };

    const handleInputPrizeChange = (event, index) => {
        const { name, value } = event.target;

        const newPrizes = [...prizes];
        newPrizes[index][name] = value;
        newPrizes[index]['index'] = index;
        setPrizes(newPrizes);
    };

    const handleInputFontChange = (event, index) => {
        const { name, value } = event.target;

        const newPrizes = [...prizes];
        newPrizes[index].fonts[0][name] = value;
        newPrizes[index]['index'] = index;
        setPrizes(newPrizes);
    };

    const handleOnClose = () => {
        setOpen(false);
        setFormData({});
    };

    // Handle create user submission
    const handleCreateSubmit = async () => {
        const payload = {
            ...formData,
            prizes: JSON.stringify(prizes)
        };
        // console.log(payload);
        // return;
        try {
            await api.luckyWheel.create(payload);
            loadData(searchModal);
            setOpen(false);
            setFormData({});
            enqueueSnackbar('创建活动成功!', {
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

    const handleAddPrize = () => {
        setPrizes((prev) => [
            ...prev,
            {
                fonts: [{ text: '' }],
                range: '',
                background: prev.length % 2 ? '#b8c5f2' : '#e9e8fe',
                index: prev.length + 1,
                type: ''
            }
        ]);
    };

    const handleRemovePrize = (index) => {
        setPrizes((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <Dialog
            open={open}
            onClose={handleOnClose}
            maxWidth={'sm'}
            fullWidth
            container={document.body}
            disablePortal={false}
            aria-labelledby='create-event-dialog-title'
            PaperProps={{
                sx: {
                    borderTop: '6px solid',
                    borderTopColor: 'primary.main',
                    borderRadius: '12px'
                }
            }}>
            <DialogTitle
                id='create-event-dialog-title'
                sx={{
                    pb: 1,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiSvgIcon-root': { mr: 1 }
                }}>
                <PersonRounded color={'primary'} /> 创建活动
            </DialogTitle>
            <DialogContent dividers>
                <Grid
                    container
                    spacing={2}>
                    {items.map((item) => (
                        <Grid
                            size={{ xs: 12 }}
                            key={item.name}>
                            {item.children ? (
                                <FormControl
                                    fullWidth
                                    size={'small'}>
                                    <InputLabel>
                                        {item.label}
                                        {item.required ? ' *' : ''}
                                    </InputLabel>
                                    <Select
                                        {...item}
                                        value={formData[item.name] || ''}
                                        onChange={handleInputChange}>
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
                                    size={'small'}
                                />
                            )}
                        </Grid>
                    ))}
                </Grid>
                <Grid>
                    <Typography
                        fontWeight={'bold'}
                        mt={2}>
                        奖品列
                    </Typography>
                    {prizes.map((prize, index) => (
                        <Grid
                            key={index}
                            container
                            spacing={1}
                            mt={2}
                            alignItems={'center'}>
                            <Grid size={{ xs: 12 }}>
                                <Typography fontSize={14}>
                                    奖品 {index + 1} *
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 2.5 }}>
                                <TextField
                                    name={`range`}
                                    label={'中奖概率'}
                                    value={prize.range}
                                    onChange={(e) =>
                                        handleInputPrizeChange(e, index)
                                    }
                                    type={'number'}
                                    fullWidth
                                    size={'small'}
                                    placeholder={'1-100'}
                                />
                            </Grid>
                            <Grid size={{ xs: 2 }}>
                                <TextField
                                    type={'color'}
                                    label={'背景颜色'}
                                    value={prize.background}
                                    fullWidth
                                    size={'small'}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{ xs: 2 }}>
                                <FormControl
                                    fullWidth
                                    size={'small'}>
                                    <InputLabel>类型</InputLabel>
                                    <Select
                                        name={'type'}
                                        label={'类型 *'}
                                        value={prize.type}
                                        onChange={(e) =>
                                            handleInputPrizeChange(e, index)
                                        }>
                                        <MenuItem value={'point'}>
                                            积分
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                {prize.fonts.map((font, fidx) => (
                                    <TextField
                                        key={fidx}
                                        name={`text`}
                                        label={'文字内容'}
                                        value={font.text}
                                        onChange={(e) =>
                                            handleInputFontChange(e, index)
                                        }
                                        fullWidth
                                        size={'small'}
                                        type={
                                            prize.type === 'point'
                                                ? 'number'
                                                : 'text'
                                        }
                                    />
                                ))}
                            </Grid>
                            <Grid>
                                <IconButton
                                    onClick={() => handleRemovePrize(index)}
                                    size={'small'}>
                                    <DeleteRounded />
                                </IconButton>
                            </Grid>
                        </Grid>
                    ))}
                    <Button
                        variant={'outlined'}
                        startIcon={<AddRounded />}
                        sx={{ mt: 2 }}
                        onClick={handleAddPrize}>
                        添加其他奖品
                    </Button>
                </Grid>
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
}
