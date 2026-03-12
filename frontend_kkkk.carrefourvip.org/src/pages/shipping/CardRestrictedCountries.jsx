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

export default function CardRestrictedCountries({ data, loadData }) {
    const [restrictedCountries, setRestrictedCountries] = useState([]);

    const fields = [
        {
            name: 'city',
            label: '城市'
        },
        {
            name: 'country',
            label: '国家'
        }
    ];

    useEffect(() => {
        const jsonData = normalizeArray(data.restrictedCountries);
        setRestrictedCountries(jsonData);
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
                    restrictedCountries: JSON.stringify(restrictedCountries)
                })
            };

            await api.settings.update(payload);
            loadData();
            enqueueSnackbar('已更新限制区域设置!', {
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
            title={'快送可达国家'}
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
                <Typography fontWeight={'bold'}>快送可达国家</Typography>
                <Button
                    variant={'contained'}
                    size={'small'}
                    onClick={() =>
                        setRestrictedCountries((prev = []) => [
                            ...prev,
                            {
                                city: '',
                                country: ''
                            }
                        ])
                    }>
                    添加
                </Button>
            </Box>
            {restrictedCountries.map((item, index) => (
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

                                    setRestrictedCountries((prev = []) => {
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
            {restrictedCountries.length > 0 && (
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
