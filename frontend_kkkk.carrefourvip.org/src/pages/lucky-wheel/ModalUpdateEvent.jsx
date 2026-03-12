import { useEffect, useState } from 'react';
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
import { DatePicker } from '@mui/x-date-pickers';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';

export default function ModalUpdateEvent({
    open,
    data,
    setOpen,
    loadData,
    searchModal
}) {
    const items = [
        {
            name: 'template',
            label: '模板名称',
            required: true,
            children: [
                {
                    value: 'lucky_wheel',
                    label: '幸运大转盘'
                }
            ]
        },
        {
            name: 'name',
            label: '活动名称',
            required: true,
            helperText: '* 仅英文名称 *'
        },
        {
            name: 'type',
            label: '活动类型',
            required: true,
            children: [
                {
                    value: 'daily_task',
                    label: '每日登录'
                }
            ]
        },
        {
            name: 'remark',
            label: '备注'
        }
    ];
    const { t } = useTranslation();
    const [prizes, setPrizes] = useState([
        {
            fonts: [{ text: '' }],
            background: '#e9e8fe',
            range: ''
        },
        {
            fonts: [{ text: '' }],
            background: '#b8c5f2',
            range: ''
        }
    ]);
    const [formData, setFormData] = useState({});
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        setFormData(data ?? {});
        setStartDate(dayjs(data?.startDate));
        setEndDate(data?.endDate ? dayjs(data?.endDate) : null);
    }, [data]);

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
        setPrizes(newPrizes);
    };

    const handleInputFontChange = (event, index) => {
        const { name, value } = event.target;

        const newPrizes = [...prizes];
        newPrizes[index].fonts[0][name] = value;
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
            startDate,
            endDate,
            prizes: JSON.stringify(prizes)
        };
        // console.log(payload);
        // return;
        try {
            await api.event.create(payload);
            loadData(searchModal);
            setOpen(false);
            setFormData({});
            enqueueSnackbar('编辑活动成功!', {
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
                background: prev.length % 2 ? '#b8c5f2' : '#e9e8fe'
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
            aria-labelledby='update-event-dialog-title'
            PaperProps={{
                sx: {
                    borderTop: '6px solid',
                    borderTopColor: 'primary.main',
                    borderRadius: '12px'
                }
            }}>
            <DialogTitle
                id='update-event-dialog-title'
                sx={{
                    pb: 1,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiSvgIcon-root': { mr: 1 }
                }}>
                <PersonRounded color='primary' /> 编辑活动
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
                    <Grid size={{ xs: 6 }}>
                        <DatePicker
                            name={'startDate'}
                            label={t('table.startDate')}
                            value={startDate}
                            onChange={(date) => setStartDate(date)}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    size: 'small',
                                    required: true
                                }
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <DatePicker
                            name={'endDate'}
                            label={t('table.endDate')}
                            value={endDate}
                            onChange={(date) => setEndDate(date)}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    size: 'small'
                                }
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid>
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
                            <Grid>
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
                    {t('table.update')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
