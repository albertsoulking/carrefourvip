import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';
import CardDeliveryRule from './CardDeliveryRule';
import CardRestrictedCountries from './CardRestrictedCountries';
import CardBusinessHours from './CardBusinessHours';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5
        }
    }
};

const DeliverySettingPage = () => {
    const [deliveryData, setDeliveryData] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const payload = {
                key: 'delivery',
                group: 'setting'
            };

            const res = await api.settings.get(payload);
            setDeliveryData(res.data);
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
        <Box sx={{ p: 3 }}>
            <motion.div
                variants={containerVariants}
                initial={'hidden'}
                animate={'visible'}>
                {deliveryData && Object.keys(deliveryData).length > 0 && (
                    <>
                        <motion.div variants={itemVariants}>
                            <CardDeliveryRule
                                data={deliveryData}
                                loadData={loadData}
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <CardRestrictedCountries
                                data={deliveryData}
                                loadData={loadData}
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <CardBusinessHours
                                data={deliveryData}
                                loadData={loadData}
                            />
                        </motion.div>
                    </>
                )}
            </motion.div>
        </Box>
    );
};

export default DeliverySettingPage;
