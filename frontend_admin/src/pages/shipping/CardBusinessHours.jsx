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

export default function CardBusinessHours({ data, loadData }) {
    const [businessHours, setBusinessHours] = useState([]);

    useEffect(() => {
        const jsonData = normalizeArray(data.businessHours);
        setBusinessHours(jsonData);
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
                    businessHours: JSON.stringify(businessHours)
                })
            };

            await api.settings.update(payload);
            loadData();
            enqueueSnackbar('已更新营业设置!', {
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

    const handleChange = (event, index) => {
        const { name, value } = event.target;

        setBusinessHours((prev = []) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [name]: value || ''
            };
            return updated;
        });
    };

    return (
        <Card
            title={'超市营业时间 (北京时间)'}
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
                <Typography fontWeight={'bold'}>超市营业时间 (北京时间)</Typography>
            </Box>
            {businessHours.map((item, index) => (
                <Box
                    display={'flex'}
                    flexWrap={'wrap'}
                    alignItems={'center'}
                    gap={2}
                    sx={{ mt: 2 }}
                    key={index}>
                    <Typography
                        width={150}
                        ml={2}>
                        {item.name}
                    </Typography>
                    <TextField
                        label={'营业时间'}
                        name={'open'}
                        value={item.open || ''}
                        size={'small'}
                        onChange={(e) => handleChange(e, index)}
                    />
                    :
                    <TextField
                        label={'打样时间'}
                        name={'close'}
                        value={item.close || ''}
                        size={'small'}
                        onChange={(e) => handleChange(e, index)}
                    />
                    <Divider sx={{ width: '100%' }} />
                </Box>
            ))}
            {businessHours.length > 0 && (
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
