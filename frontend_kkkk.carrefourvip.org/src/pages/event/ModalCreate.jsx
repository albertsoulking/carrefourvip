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
    Grid
} from '@mui/material';
import { PersonRounded } from '@mui/icons-material';
import api from '../../routes/api';
import { DatePicker } from '@mui/x-date-pickers';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export default function ModalCreate({
    open,
    setOpen,
    loadData,
    searchModal,
    luckyWheelData
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
        },
        {
            name: 'luckyWheelId',
            label: '转盘模型',
            children: luckyWheelData.map((w) => ({
                value: w.id,
                label: w.name
            }))
        }
    ];
    const { t } = useTranslation();
    const [formData, setFormData] = useState({});
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value ?? ''
        });
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
            endDate
        };

        try {
            await api.event.create(payload);
            loadData(searchModal);
            handleOnClose();
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
                <PersonRounded color='primary' /> 创建活动
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
