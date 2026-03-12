import {
    Box,
    Button,
    Card,
    Divider,
    TextField,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import api from '../../routes/api';

export default function CardDeliveryRule({ data, loadData }) {
    const [deliveryRules, setDeliveryRules] = useState([]);

    const fields = [
        {
            name: 'name',
            label: '名称',
            type: 'text'
        },
        {
            name: 'code',
            label: '代号',
            type: 'text'
        },
        {
            name: 'minStandard',
            label: '标准最小金额(€)',
            type: 'number'
        },
        {
            name: 'maxStandard',
            label: '标准最大金额(€)',
            type: 'number'
        },
        {
            name: 'feeStandard',
            label: '标准配送费(€)',
            type: 'number'
        },
        {
            name: 'minAdvanced',
            label: '高级最小金额(€)',
            type: 'number'
        },
        {
            name: 'maxAdvanced',
            label: '高级最大金额(€)',
            type: 'number'
        },
        {
            name: 'feeAdvanced',
            label: '高级配送费(€)',
            type: 'number'
        },
        {
            name: 'minFree',
            label: '免费最小金额(€)',
            type: 'number'
        },
        {
            name: 'maxFree',
            label: '免费最大金额(€)',
            type: 'number'
        },
        {
            name: 'feeFree',
            label: '免费配送费(€)',
            type: 'number'
        },
        {
            name: 'processingDelayMin',
            label: '付款->备货中最小时间(小时)',
            type: 'number'
        },
        {
            name: 'processingDelayMax',
            label: '付款->备货中最小时间(小时)',
            type: 'number'
        },
        {
            name: 'shippedDelayMin',
            label: '备货中->发货中最小时间(小时)',
            type: 'number'
        },
        {
            name: 'shippedDelayMax',
            label: '备货中->发货中最小时间(小时)',
            type: 'number'
        },
        {
            name: 'deliveredDelayMin',
            label: '发货中->已送达最小时间(小时)',
            type: 'number'
        },
        {
            name: 'deliveredDelayMax',
            label: '发货中->已送达最小时间(小时)',
            type: 'number'
        },
        {
            name: 'autoCancelUnpaidHours',
            label: '未付款订单自动取消时间(小时)',
            type: 'number'
        }
    ];

    useEffect(() => {
        const jsonData = normalizeArray(data.deliveryRules);
        setDeliveryRules(jsonData);
    }, [data]);

    const normalizeArray = (input) => {
        if (Array.isArray(input)) {
            return input;
        }

        if (typeof input === 'string') {
            try {
                const parsed = JSON.parse(input);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('normalizeArray - Invalid JSON:', e);
                return [];
            }
        }

        return [];
    };

    const handleSave = async () => {
        try {
            const payload = {
                key: 'delivery',
                group: 'setting',
                value: JSON.stringify({
                    ...data,
                    deliveryRules: JSON.stringify(deliveryRules)
                })
            };

            await api.settings.update(payload);
            loadData();
            enqueueSnackbar('已更新配送设置!', {
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
        <Card
            title={'配送运费规则'}
            sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                boxShadow:
                    '0 6px 24px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0,0,0,0.08)'
            }}>
            <Box
                display={'flex'}
                justifyContent={'space-between'}>
                <Typography fontWeight={'bold'}>配送运费规则</Typography>
                <Button
                    variant={'contained'}
                    size={'small'}
                    onClick={() =>
                        setDeliveryRules((prev = []) => [
                            ...prev,
                            {
                                name: '',
                                remark: '',
                                minStandard: '',
                                minAdvanced: '',
                                minFree: '',
                                maxStandard: '',
                                maxAdvanced: '',
                                maxFree: '',
                                feeStandard: '',
                                feeAdvanced: '',
                                feeFree: '',
                                processingDelayMin: '',
                                processingDelayMax: '',
                                shippedDelayMin: '',
                                shippedDelayMax: '',
                                deliveredDelayMin: '',
                                deliveredDelayMax: '',
                                autoCancelUnpaidHours: ''
                            }
                        ])
                    }>
                    添加
                </Button>
            </Box>
            {deliveryRules.map((item, index) => (
                <Box
                    display={'flex'}
                    flexWrap={'wrap'}
                    gap={2}
                    sx={{ mt: 2 }}
                    key={index}>
                    {fields.map((field) => (
                        <Box key={field.name}>
                            <TextField
                                {...field}
                                value={item[field.name] || ''}
                                size={'small'}
                                onChange={(e) => {
                                    const { name, value } = e.target;

                                    setDeliveryRules((prev = []) => {
                                        const updated = [...prev];
                                        updated[index] = {
                                            ...updated[index],
                                            [name]: value || ''
                                        };
                                        return updated;
                                    });
                                }}
                            />
                        </Box>
                    ))}
                    <Divider sx={{ width: '100%' }} />
                </Box>
            ))}
            {deliveryRules.length > 0 && (
                <Box textAlign={'end'}>
                    <Button
                        variant={'contained'}
                        size={'small'}
                        sx={{ mt: 2 }}
                        onClick={handleSave}>
                        保存更改
                    </Button>
                </Box>
            )}
        </Card>
    );
}
