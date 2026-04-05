import {
    AccessTimeFilledRounded,
    AttachMoneyRounded,
    BackupRounded,
    CancelRounded,
    CheckCircleRounded,
    CurrencyExchangeRounded,
    DeleteRounded,
    EmailRounded,
    InventoryRounded,
    LocalShippingRounded,
    LocationOnRounded,
    PersonRounded,
    PhoneRounded,
    UploadRounded
} from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Typography,
    Stack,
    InputAdornment,
    Avatar,
    TextField
} from '@mui/material';
import RowAvatar from './RowAvatar';
import { useEffect, useRef, useState } from 'react';
import api from '../../routes/api';
import usePermissionStore from '../../hooks/usePermissionStore';
import { enqueueSnackbar } from 'notistack';

const ModalViewOrderDetail = ({
    open,
    setOpen,
    data
}) => {
    const permissions = usePermissionStore((state) => state.permissions);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const inputRef = useRef();
    const [openImageViewer, setOpenImageViewer] = useState(false);

    const stepConfigFull = [
        {
            key: 'pending',
            label: '进行中',
            icon: <AccessTimeFilledRounded fontSize={'small'} />
        },
        {
            key: 'paid',
            label: '已付款',
            icon: <AttachMoneyRounded fontSize={'small'} />
        },
        {
            key: 'processing',
            label: '备货中',
            icon: <InventoryRounded fontSize={'small'} />
        },
        {
            key: 'shipped',
            label: '已送货',
            icon: <LocalShippingRounded fontSize={'small'} />
        },
        {
            key: 'delivered',
            label: '已送达',
            icon: <CheckCircleRounded fontSize={'small'} />
        }
    ];

    const stepConfigCancelled = [
        {
            key: 'pending',
            label: '进行中',
            icon: <AccessTimeFilledRounded fontSize={'small'} />
        },
        {
            key: 'cancelled',
            label: '已取消',
            icon: <CancelRounded fontSize={'small'} />
        }
    ];

    const stepConfigRefunded = [
        {
            key: 'pending',
            label: '进行中',
            icon: <AccessTimeFilledRounded fontSize={'small'} />
        },
        {
            key: 'paid',
            label: '已付款',
            icon: <AttachMoneyRounded fontSize={'small'} />
        },
        {
            key: 'refunded',
            label: '已退款',
            icon: <CurrencyExchangeRounded fontSize={'small'} />
        }
    ];

    const timestamps = {
        paid: data?.paidAt,
        processing: data?.processingAt,
        shipped: data?.shippedAt,
        delivered: data?.deliveredAt,
        cancelled: data?.cancelledAt,
        pending: data?.createdAt,
        refunded: data?.refundedAt,
        estimatedProcessing: data?.estimatedProcessingAt,
        estimatedShipped: data?.estimatedShippedAt,
        estimatedDelivered: data?.estimatedDeliveredAt
    };

    const formatCountdown = (targetTime) => {
        const now = new Date();
        const target = new Date(targetTime);
        const diff = target.getTime() - now.getTime(); // 毫秒差

        const absDiff = Math.abs(diff);

        const minutes = Math.floor(absDiff / 1000 / 60) % 60;
        const hours = Math.floor(absDiff / 1000 / 60 / 60) % 24;
        const days = Math.floor(absDiff / 1000 / 60 / 60 / 24);

        const parts = [];
        if (days > 0) parts.push(`${days}天`);
        if (hours > 0) parts.push(`${hours}小时`);
        if (minutes > 0) parts.push(`${minutes}分钟`);

        const timeStr = parts.length ? parts.join('') : '1分钟内';

        return diff > 0 ? (
            `预计${timeStr}内`
        ) : (
            <span style={{ color: 'transparent' }}>-</span>
        );
    };

    const isCancelled = data?.status === 'cancelled';
    const isRefunded = data?.status === 'refunded';
    const steps = isCancelled
        ? stepConfigCancelled
        : isRefunded
        ? stepConfigRefunded
        : stepConfigFull;
    const currentIndex = steps.findIndex((s) => s.key === data?.status);

    useEffect(() => {
        setPreviewUrl(
            data?.deliveryProofImages
                ? `${import.meta.env.VITE_API_BASE_URL}/uploads/thumbs/${
                      data?.deliveryProofImages
                  }`
                : ''
        );
    }, [data?.deliveryProofImages]);

    const handleOnUploadDeliveryPhoto = async (imageUrl) => {
        const payload = {
            id: data?.id,
            status: data?.status,
            paymentStatus: data?.paymentStatus,
            deliveryMethod: data?.deliveryMethod,
            payMethod: data?.payMethod,
            deliveryProofImages: imageUrl
        };

        await api.orders.update(payload);
    };

    const handleOnClose = () => {
        setOpen(false);
        setFile(null);
        setPreviewUrl('');
        inputRef.current.value = '';
    };

    const placeUserOrder = async (data) => {
        const payload = {
            id: data?.id,
            status: 'pending',
            paymentStatus: 'paid'
        };
        try {
            await api.orders.update(payload);
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

    const updateData = async ({
        id,
        status,
        paymentStatus,
        paymentLink,
        deliveryMethod,
        payMethod,
        deliveryProofImages
    }) => {
        try {
            await api.orders.update({
                id,
                status,
                paymentStatus,
                paymentLink,
                deliveryMethod,
                payMethod,
                deliveryProofImages
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
            maxWidth={'md'}
            fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                    edge={'start'}
                    color={'inherit'}
                    onClick={handleOnClose}
                    sx={{ mr: 1 }}>
                    <BackupRounded />
                </IconButton>
                订单号: #{data?.id}
            </DialogTitle>
            <DialogContent dividers>
                {/** Order Time */}
                <Typography
                    variant={'subtitle2'}
                    color={'textSecondary'}
                    mb={1}>
                    订单状态
                </Typography>
                <Box
                    display={'flex'}
                    width={'100%'}
                    justifyContent={'space-between'}>
                    {steps.map((step, index) => {
                        const isActive = index === currentIndex;
                        const isCompleted = index < currentIndex;
                        const showAsDone = isCompleted || isActive;

                        // ✅ 显示图标逻辑
                        const icon = isCancelled ? (
                            <CancelRounded fontSize={'small'} />
                        ) : isRefunded ? (
                            <CurrencyExchangeRounded fontSize={'small'} />
                        ) : showAsDone ? (
                            <CheckCircleRounded fontSize={'small'} />
                        ) : (
                            step.icon
                        );

                        // ✅ 显示颜色逻辑
                        const color = isCancelled
                            ? 'error'
                            : isRefunded
                            ? 'secondary'
                            : showAsDone
                            ? 'primary'
                            : 'default';

                        // ✅ 时间逻辑
                        const actualTime = timestamps[step.key];
                        const estimatedKey = `estimated${step.key
                            .charAt(0)
                            .toUpperCase()}${step.key.slice(1)}`;
                        const estimatedTime = timestamps[estimatedKey];
                        const timeLabel = actualTime ? (
                            new Date(actualTime).toLocaleString()
                        ) : estimatedTime ? (
                            new Date(estimatedTime).toLocaleString()
                        ) : (
                            <span style={{ color: 'transparent' }}>-</span>
                        );
                        const ongoingTimeLable = formatCountdown(estimatedTime);

                        return (
                            <Box
                                key={step.key}
                                flex={1}
                                textAlign={'center'}>
                                <Stack
                                    spacing={0.5}
                                    alignItems={'center'}
                                    position={'relative'}>
                                    <Typography
                                        variant={'subtitle2'}
                                        color={'text.secondary'}>
                                        {ongoingTimeLable}
                                    </Typography>
                                    <Chip
                                        label={step.label}
                                        icon={icon}
                                        color={color}
                                        variant={'filled'}
                                    />
                                    <Typography
                                        variant={'subtitle2'}
                                        color={'text.secondary'}>
                                        {isCancelled &&
                                        step.key === 'cancelled' &&
                                        !actualTime
                                            ? '订单已取消'
                                            : timeLabel}
                                    </Typography>
                                    <Divider
                                        sx={{
                                            bgcolor: isCancelled
                                                ? '#d32f2f'
                                                : isRefunded
                                                ? '#9c27b0'
                                                : showAsDone
                                                ? '#1976d2'
                                                : '',
                                            height: 3,
                                            width: '50%',
                                            position: 'absolute',
                                            top: '45%',
                                            left: '-25%',
                                            transform: 'translateY(-50%)',
                                            display:
                                                index > 0 ? 'inline' : 'none',
                                            p: 0
                                        }}
                                    />
                                </Stack>
                            </Box>
                        );
                    })}
                </Box>
                <Divider sx={{ my: 1 }} />
                {/** User Information */}
                <Box>
                    <Typography
                        variant={'subtitle2'}
                        color={'textSecondary'}
                        gutterBottom>
                        物流信息
                    </Typography>
                    <Box
                        display={'flex'}
                        alignItems={'center'}
                        gap={1}>
                        {/* Hidden File Input */}
                        <input
                            ref={inputRef}
                            type={'file'}
                            accept={'image/*'}
                            onChange={async (event) => {
                                const file = event.target.files[0];

                                if (!file) return;

                                setFile(file);
                                setPreviewUrl(URL.createObjectURL(file));

                                const formData = new FormData();
                                formData.append('file', file, file.name);

                                const res = await api.utilities.upload(
                                    formData
                                );

                                handleOnUploadDeliveryPhoto(res.data.name);
                            }}
                            style={{ display: 'none' }}
                        />
                        {/* Fake TextField */}
                        <TextField
                            fullWidth
                            margin={'normal'}
                            label={'上传图片'}
                            value={
                                previewUrl === ''
                                    ? ''
                                    : file?.name ||
                                      data?.deliveryProofImages ||
                                      ''
                            }
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
                                                mr: 1,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                setPreviewUrl(
                                                    `${
                                                        import.meta.env
                                                            .VITE_API_BASE_URL
                                                    }/uploads/images/${
                                                        data?.deliveryProofImages
                                                    }`
                                                );
                                                setOpenImageViewer(true);
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position={'end'}>
                                        {previewUrl && (
                                            <IconButton
                                                onClick={() => {
                                                    setFile(null);
                                                    setPreviewUrl('');
                                                    inputRef.current.value = '';

                                                    handleOnUploadDeliveryPhoto();
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
                </Box>
                <Divider sx={{ my: 1 }} />
                {/** User Information */}
                <Box>
                    <Typography
                        variant={'subtitle2'}
                        color={'textSecondary'}
                        gutterBottom>
                        发件人信息
                    </Typography>
                    <Grid
                        container
                        spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1
                                }}>
                                <PersonRounded
                                    color={'primary'}
                                    sx={{ mr: 1 }}
                                    fontSize={'small'}
                                />
                                <Typography variant={'body2'}>
                                    {data?.user?.name}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1
                                }}>
                                <PhoneRounded
                                    color={'primary'}
                                    sx={{ mr: 1 }}
                                    fontSize={'small'}
                                />
                                <Typography variant={'body2'}>
                                    {data?.user?.phone}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1
                                }}>
                                <EmailRounded
                                    color={'primary'}
                                    sx={{ mr: 1 }}
                                    fontSize={'small'}
                                />
                                <Typography variant={'body2'}>
                                    {data?.user?.email}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography
                                variant={'subtitle2'}
                                color={'textSecondary'}
                                gutterBottom>
                                地址
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1
                                }}>
                                <LocationOnRounded
                                    color={'primary'}
                                    sx={{ mr: 1 }}
                                    fontSize={'small'}
                                />
                                <Typography variant={'body2'}>
                                    {data?.user?.city || '-'}/
                                    {data?.user?.state || '-'}/
                                    {data?.user?.country || '-'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                <Divider sx={{ my: 1 }} />
                {/* Customer Information */}
                <Box>
                    <Typography
                        variant={'subtitle2'}
                        color={'textSecondary'}
                        gutterBottom>
                        收件人信息
                    </Typography>
                    <Grid
                        container
                        spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1
                                }}>
                                <PersonRounded
                                    color={'primary'}
                                    sx={{ mr: 1 }}
                                    fontSize={'small'}
                                />
                                <Typography variant={'body2'}>
                                    {data?.userName}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1
                                }}>
                                <PhoneRounded
                                    color={'primary'}
                                    sx={{ mr: 1 }}
                                    fontSize={'small'}
                                />
                                <Typography variant={'body2'}>
                                    {data?.userMobile}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography
                                variant={'subtitle2'}
                                color={'textSecondary'}
                                gutterBottom>
                                送货地址
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1
                                }}>
                                <LocationOnRounded
                                    color={'primary'}
                                    sx={{ mr: 1 }}
                                    fontSize={'small'}
                                />
                                <Typography variant={'body2'}>
                                    {data?.userAddress}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                <Divider sx={{ my: 1 }} />
                {/* Order Items */}
                <Box>
                    <Typography
                        variant={'subtitle2'}
                        color={'textSecondary'}
                        gutterBottom>
                        订单项目
                    </Typography>
                    {data?.items?.map((item, index) => (
                        <Grid
                            key={index}
                            container
                            justifyContent={'space-between'}
                            alignItems={'center'}
                            flexWrap={'nowrap'}
                            sx={{
                                mb: 1
                            }}>
                            <Grid
                                size={{ xs: 9 }}
                                container
                                flexWrap={'nowrap'}
                                alignItems={'center'}>
                                <Typography
                                    fontSize={14}
                                    fontWeight={'bold'}
                                    mr={2}>
                                    {index + 1}.
                                </Typography>
                                <RowAvatar imageUrl={item.productImage} />
                                <Box ml={1}>
                                    <Typography
                                        fontSize={14}
                                        noWrap>
                                        {item.productName}
                                    </Typography>
                                    {item.attributes && (
                                        <Typography fontSize={12}>
                                            {(() => {
                                                const attrs = JSON.parse(
                                                    item.attributes || '{}'
                                                );

                                                return attrs.variants
                                                    ? attrs.variants.map(
                                                          (v, index) => (
                                                              <span key={index}>
                                                                  {v.name}:{' '}
                                                                  {v[v.code]}
                                                                  {index ===
                                                                  attrs.variants
                                                                      .length -
                                                                      1
                                                                      ? ''
                                                                      : ' / '}
                                                              </span>
                                                          )
                                                      )
                                                    : '';
                                            })()}
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                            <Grid
                                size={{ xs: 3 }}
                                container
                                alignItems={'center'}
                                justifyContent={'flex-end'}>
                                <Typography
                                    variant={'body2'}
                                    noWrap>
                                    {item.quantity} x €
                                    {Number(item.unitPrice).toLocaleString(
                                        undefined,
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    )}{' '}
                                    = €
                                    {Number(item.totalPrice).toLocaleString(
                                        undefined,
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    )}
                                </Typography>
                            </Grid>
                        </Grid>
                    ))}
                </Box>
                <Divider sx={{ my: 1 }} />
                {/* Order Summary */}
                <Box sx={{ maxWidth: 300, ml: 'auto' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                        <Typography
                            variant={'subtitle2'}
                            color={'textSecondary'}>
                            小计:
                        </Typography>
                        <Typography variant={'body2'}>
                            €
                            {Number(data?.subtotal).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                        <Typography
                            variant={'subtitle2'}
                            color={'textSecondary'}>
                            增值税 (
                            {(
                                (Number(data?.vat) / Number(data?.subtotal)) *
                                100
                            ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                            %):
                        </Typography>
                        <Typography variant={'body2'}>
                            €
                            {Number(data?.vat).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                        <Typography
                            variant={'subtitle2'}
                            color={'textSecondary'}>
                            送货费:
                        </Typography>
                        <Typography variant={'body2'}>
                            €
                            {Number(data?.deliveryFee).toLocaleString(
                                undefined,
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                        <Typography
                            variant={'subtitle2'}
                            color={'textSecondary'}>
                            总价:
                        </Typography>
                        <Typography variant={'body2'}>
                            €
                            {Number(data?.totalPrice).toLocaleString(
                                undefined,
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                        <Typography
                            variant={'subtitle2'}
                            color={'textSecondary'}>
                            余额支付:
                        </Typography>
                        <Typography variant={'body2'}>
                            -€
                            {Number(data?.balanceDeduct).toLocaleString(
                                undefined,
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                        <Typography
                            variant={'subtitle2'}
                            color={'textSecondary'}>
                            优惠({(
                                (Number(data?.discountPayPal) / Number(data?.totalPrice)) *
                                100
                            ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                            %):
                        </Typography>
                        <Typography variant={'body2'}>
                            -€
                            {Number(data?.discountPayPal).toLocaleString(
                                undefined,
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}
                        </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                        <Typography
                            variant={'subtitle2'}
                            color={'textSecondary'}>
                            实际付款:
                        </Typography>
                        <Typography
                            variant={'h5'}
                            fontWeight={'bold'}>
                            €
                            {Number(data?.payAmount).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between' }}>
                {data &&
                data?.paymentStatus === 'paid' &&
                data?.status !== 'delivered' &&
                permissions.includes('order.rejectOrder') ? (
                    <Box
                        display={'flex'}
                        alignItems={'center'}>
                        <Button
                            onClick={() => {
                                handleOnClose();
                                updateData({
                                    ...data,
                                    status: 'refunded',
                                    paymentStatus: 'refunded'
                                });
                            }}
                            variant={'contained'}
                            color={'secondary'}>
                            拒绝该订单
                        </Button>
                        <Typography
                            fontSize={12}
                            color={'error'}
                            ml={1}>
                            *已拒绝订单的余额会自动退还给客户*
                        </Typography>
                    </Box>
                ) : data?.paymentStatus === 'pending' &&
                  data?.status === 'pending' &&
                  permissions.includes('order.cancelOrder') ? (
                    <Box
                        display={'flex'}
                        alignItems={'center'}>
                        <Button
                            onClick={() => {
                                handleOnClose();
                                updateData({
                                    ...data,
                                    status: 'cancelled',
                                    paymentStatus: 'cancelled'
                                });
                            }}
                            variant={'contained'}
                            color={'error'}>
                            取消该订单
                        </Button>
                        <Typography
                            fontSize={12}
                            color={'error'}
                            ml={1}>
                            *未付款订单将在24小时内自动取消*
                        </Typography>
                    </Box>
                ) : (
                    <Box flexGrow={1}></Box>
                )}
                <Box>
                    {data?.paymentStatus === 'pending' &&
                        permissions.includes('order.placeOrder') && (
                            <Button
                                onClick={() => {
                                    handleOnClose();
                                    placeUserOrder(data);
                                }}
                                variant={'contained'}
                                color={'primary'}>
                                手动发货
                            </Button>
                        )}
                    <Button
                        sx={{ ml: 1 }}
                        onClick={handleOnClose}
                        variant={'outlined'}
                        color={'action'}>
                        关闭
                    </Button>
                </Box>
            </DialogActions>
            <Dialog
                open={openImageViewer}
                onClose={() => setOpenImageViewer(false)}>
                <img
                    src={previewUrl}
                    alt={previewUrl}
                    style={{ objectFit: 'contain', borderRadius: 4 }}
                    onClick={() => setOpenImageViewer(false)}
                />
            </Dialog>
        </Dialog>
    );
};

export default ModalViewOrderDetail;
