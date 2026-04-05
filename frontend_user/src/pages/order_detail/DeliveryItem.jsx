import { Box, Button, Chip, Typography } from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineDot,
    TimelineConnector,
    TimelineContent,
    TimelineOppositeContent
} from '@mui/lab';
import {
    AccessTimeFilledRounded,
    AttachMoneyRounded,
    CancelRounded,
    CheckCircleRounded,
    CloudUpload,
    CurrencyExchangeRounded,
    InventoryRounded,
    LocalShippingRounded
} from '@mui/icons-material';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import ModalViewImage from './ModalViewImage';

const DeliveryItem = ({
    id,
    status,
    paidAt,
    processingAt,
    shippedAt,
    deliveredAt,
    cancelledAt,
    refundedAt,
    createdAt,
    deliveryProofImages,
    loadData
}) => {
    const [openImage, setOpenImage] = useState(false);

    const normalSteps = [
        {
            title: 'Completed',
            image: deliveryProofImages,
            time: deliveredAt,
            completed: deliveredAt !== null,
            icon: <CheckCircleRounded />
        },
        {
            title: 'Delivering',
            image: '',
            time: shippedAt,
            completed: shippedAt !== null,
            icon: <LocalShippingRounded />
        },
        {
            title: 'Processing',
            image: '',
            time: processingAt,
            completed: processingAt !== null,
            icon: <InventoryRounded />
        },
        {
            title: 'Paid',
            image: '',
            time: paidAt,
            completed: paidAt !== null,
            icon: <AttachMoneyRounded />
        },
        {
            title: 'Pending',
            image: '',
            time: createdAt,
            completed: createdAt !== null,
            icon: <AccessTimeFilledRounded />
        }
    ];

    const cancelSteps = [
        {
            title: 'Cancelled',
            image: '',
            time: cancelledAt,
            completed: cancelledAt !== null,
            icon: <CancelRounded />
        },
        {
            title: 'Pending',
            image: '',
            time: createdAt,
            completed: createdAt !== null,
            icon: <AccessTimeFilledRounded />
        }
    ];

    const refundSteps = [
        {
            title: 'Refunded',
            image: '',
            time: refundedAt,
            completed: refundedAt !== null,
            icon: <CurrencyExchangeRounded />
        },
        {
            title: 'Paid',
            image: '',
            time: paidAt,
            completed: paidAt !== null,
            icon: <AttachMoneyRounded />
        },
        {
            title: 'Pending',
            image: '',
            time: createdAt,
            completed: createdAt !== null,
            icon: <AccessTimeFilledRounded />
        }
    ];

    const steps =
        status === 'cancelled'
            ? cancelSteps
            : status === 'refunded'
            ? refundSteps
            : normalSteps;

    const handleOnUploadDeliveryPhoto = async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        const formData = new FormData();
        formData.append('file', file, file.name);

        const res = await api.utilities.upload(formData);

        const payload = {
            orderId: id,
            image: res.data.name
        };

        try {
            await api.orders.updateOne(payload);
            loadData();
            enqueueSnackbar('Delivery photo uploaded successfully!', {
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
        <Box sx={{ mb: 2 }}>
            <Typography
                variant={'body1'}
                fontWeight={'bold'}>
                Logistics Information
            </Typography>
            <Timeline position={'right'}>
                {steps &&
                    steps.map((step, index) => (
                        <TimelineItem key={index}>
                            <TimelineOppositeContent
                                variant={'caption'}
                                color={'text.secondary'}
                                translate={'no'}
                                mt={0.5}>
                                {step.time
                                    ? new Date(step.time).toLocaleString()
                                    : '-'}
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineDot
                                    color={
                                        step.completed
                                            ? status === 'cancelled'
                                                ? 'error'
                                                : status === 'refunded'
                                                ? 'secondary'
                                                : 'primary'
                                            : 'grey'
                                    }
                                />
                                {index < steps.length - 1 && (
                                    <TimelineConnector
                                        sx={{
                                            bgcolor:
                                                status === 'cancelled'
                                                    ? '#d32f2f'
                                                    : status === 'refunded'
                                                    ? '#9c27b0'
                                                    : step.completed
                                                    ? '#1976d2'
                                                    : ''
                                        }}
                                    />
                                )}
                            </TimelineSeparator>
                            <TimelineContent>
                                <Chip
                                    label={step.title}
                                    size={'small'}
                                    icon={
                                        step.completed ? (
                                            <CheckCircleRounded />
                                        ) : (
                                            step.icon
                                        )
                                    }
                                    color={
                                        step.completed
                                            ? status === 'cancelled'
                                                ? 'error'
                                                : status === 'refunded'
                                                ? 'secondary'
                                                : 'primary'
                                            : 'grey'
                                    }
                                />
                                {step.image && (
                                    <Box mt={1}>
                                        <img
                                            src={`${
                                                import.meta.env
                                                    .VITE_API_BASE_URL
                                            }/uploads/thumbs/${step.image}`}
                                            alt={'Image'}
                                            style={{
                                                width: '100%',
                                                borderRadius: 8,
                                                objectFit: 'cover',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setOpenImage(true)}
                                        />
                                    </Box>
                                )}
                            </TimelineContent>
                            <ModalViewImage
                                open={openImage}
                                image={step.image}
                                setOpen={setOpenImage}
                            />
                        </TimelineItem>
                    ))}
            </Timeline>
            {/* {status === 'delivered' && (
                <Button
                    component={'label'}
                    role={undefined}
                    variant={'outlined'}
                    tabIndex={-1}
                    startIcon={<CloudUpload />}
                    fullWidth>
                    Upload Delivery Photo
                    <input
                        type={'file'}
                        onChange={handleOnUploadDeliveryPhoto}
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
            )} */}
        </Box>
    );
};

export default DeliveryItem;
