import {
    Dialog,
    Button,
    Typography,
    Box,
    RadioGroup,
    FormControlLabel,
    Radio,
    CircularProgress,
    Checkbox,
    Divider
} from '@mui/material';
import { useState } from 'react';
import api from '../routes/api';
import { useEffect } from 'react';
import useStyledLocaleString from '../hooks/useStyledLocaleString';
import { DateTime } from 'luxon';
import { enqueueSnackbar } from 'notistack';
import ModalPaymentCheckout from './ModalPaymentCheckout';

const ModalOrderCheckout = ({ open, data, setOpen }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [paymentType, setPaymentType] = useState('');
    const [loadingNow, setLoadingNow] = useState(false);
    const [loadingLater, setLoadingLater] = useState(false);
    const [userBalance, setUserBalance] = useState(null);
    const [isBalanceChecked, setIsBalanceChecked] = useState(false);
    const [isZero, setIsZero] = useState(false);
    const [openingHours, setOpeningHours] = useState(false);
    const [siteData, setSiteData] = useState({});
    const [gateways, setGateways] = useState([]);
    const [openPayment, setOpenPayment] = useState({
        open: false,
        data: null
    });
    const [paymentGateway, setPaymentGateway] = useState(null);

    useEffect(() => {
        if (open) {
            loadData();
            loadStoreOpen();
            setSiteData(data.siteData);
        }
    }, [open]);

    useEffect(() => {
        const finalPrice = calculateWalletDiscount(
            data?.totalPrice,
            userBalance
        ).payAmount;

        setIsZero(isBalanceChecked ? finalPrice === 0 : isBalanceChecked);
    }, [isBalanceChecked]);

    const loadData = async () => {
        if (!user) return;

        const res = await api.users.getOne({ id: user?.id });
        setUserBalance(res.data.balance);

        const resGate = await api.gateway.getAll();
        setGateways(resGate.data);
    };

    const loadStoreOpen = async () => {
        const res = await api.settings.get({
            key: 'delivery',
            group: 'setting'
        });

        // 判空
        if (!res?.data || Object.keys(res.data).length === 0) return;

        const businessHours = normalizeArray(res.data.businessHours);

        // 今天星期几
        const todayIndex = new Date().getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
        const map = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ];
        const todayName = map[todayIndex];

        const todaySchedule = businessHours.find(
            (day) => day.name === todayName
        );
        if (!todaySchedule) return;

        const backendZone = 'Asia/Shanghai'; // 后台存北京时间

        // 当前北京时间
        const now = DateTime.now().setZone(backendZone);

        // 今天日期（yyyy-MM-dd）
        const todayDate = now.toFormat('yyyy-MM-dd');

        // 生成 start/end
        let start = DateTime.fromISO(`${todayDate}T${todaySchedule.open}`, {
            zone: backendZone
        });
        let end = DateTime.fromISO(`${todayDate}T${todaySchedule.close}`, {
            zone: backendZone
        });

        // 如果是跨天时段（end <= start）
        if (end <= start) {
            end = end.plus({ days: 1 });

            // 如果当前时间在凌晨（小于 start 时间点），说明属于“昨天的营业时间”
            if (now < start) {
                start = start.minus({ days: 1 });
                end = end.minus({ days: 1 });
            }
        }

        const isOpen = now >= start && now < end;
        // setOpeningHours(isOpen);
        setOpeningHours(true); // 先不限制营业时间

        // console.log({
        //     now: now.toISO(),
        //     start: start.toISO(),
        //     end: end.toISO(),
        //     isOpen
        // });
    };

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

    const handleOnPayClick = async () => {
        const calcPay = calculateWalletDiscount(data?.totalPrice, userBalance);
        if (
            (!isBalanceChecked && paymentType === '') ||
            (isBalanceChecked && calcPay.payAmount !== 0 && paymentType === '')
        ) {
            enqueueSnackbar('Please select payment method!', {
                variant: 'warning'
            });
            return;
        }

        setLoadingNow(true);

        const { siteData, ...orderData } = data;
        const payload = {
            ...orderData,
            discountPayPal: calcPay.payDiscount.toString(),
            balanceDeduct: isBalanceChecked
                ? calcPay.discount.toString()
                : '0.00',
            payAmount: calcPay.payAmount.toString(),
            payMethod: isZero
                ? 'balance'
                : isBalanceChecked
                ? 'hybrid'
                : paymentType,
            hybridMethod: isZero ? 'balance' : paymentType
        };

        try {
            let res = {
                data: payload
            };

            if (!res.data?.id) {
                res = await api.orders.createOne(payload);
            }

            setTimeout(() => {
                setLoadingNow(false);
                setLoadingLater(false);
                setLoadingNow(false);
                setUserBalance(null);
                setIsBalanceChecked(false);
                setIsZero(false);
                // setPaymentType('');
                setOpen({ open: false, data: null });

                if (Number(res.data.payAmount) === 0) {
                    window.location.href = `${window.location.origin}/payment/${res.data.id}/success`;
                    return;
                }

                setOpenPayment({ open: true, data: res.data });
            }, 500);
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

    const calculateWalletDiscount = (total, balance) => {
        total = parseFloat(total); // 确保是数字
        balance = parseFloat(balance);

        const discount = paymentGateway?.discount || 0;
        const payDiscount =
            total > 0
                ? parseFloat((total * (discount / 100)).toFixed(2)) // % 折扣
                : 0;
        const payAmount = parseFloat((total - payDiscount).toFixed(2));
        const canUseBalance = isBalanceChecked && balance > 0;
        const actualDiscount = canUseBalance ? Math.min(balance, payAmount) : 0;
        const remainingBalance = parseFloat(
            (balance - actualDiscount).toFixed(2)
        );

        return {
            payAmount: parseFloat((payAmount - actualDiscount).toFixed(2)),
            discount: parseFloat(actualDiscount.toFixed(2)),
            payDiscount: parseFloat(payDiscount.toFixed(2)),
            remainingBalance,
            totalDiscount: parseFloat((payDiscount + actualDiscount).toFixed(2))
        };
    };

    return (
        <Dialog
            open={open}
            fullWidth={false}
            maxWidth={'sm'}
            disableEnforceFocus
            keepMounted>
            <Box sx={{ borderRadius: 2, p: 2 }}>
                {!openingHours && (
                    <Typography
                        color={'error'}
                        fontSize={12}
                        textAlign={'center'}>
                        (Carrefour Community Supermarket is closed. Please
                        confirm your order during the next day's opening hours)
                    </Typography>
                )}
                <Typography
                    fontSize={18}
                    fontWeight={'bold'}
                    textAlign={'center'}
                    sx={{ lineHeight: 2.5 }}>
                    Order Preview
                </Typography>
                <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}>
                    <Typography fontSize={14}>Order ID:</Typography>
                    <Typography
                        translate={'no'}
                        textAlign={'right'}>
                        #{data?.id}
                    </Typography>
                </Box>
                <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}>
                    <Typography fontSize={14}>Number of Products:</Typography>
                    <Typography
                        translate={'no'}
                        textAlign={'right'}>
                        {data?.quantity}
                    </Typography>
                </Box>
                {siteData.deliveryAddressEnabled && (
                    <>
                        <Box
                            display={'flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}>
                            <Typography fontSize={14}>
                                Receiver Name:
                            </Typography>
                            <Typography
                                fontSize={14}
                                translate={'no'}
                                textAlign={'right'}>
                                {data?.userName}
                            </Typography>
                        </Box>
                        <Box
                            display={'flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}>
                            <Typography fontSize={14}>
                                Receiver Phone Number:
                            </Typography>
                            <Typography
                                fontSize={14}
                                translate={'no'}
                                textAlign={'right'}>
                                {data?.userMobile}
                            </Typography>
                        </Box>
                        <Box
                            display={'flex'}
                            justifyContent={'space-between'}
                            alignItems={'center'}>
                            <Typography fontSize={14}>
                                Receiver Address:
                            </Typography>
                            <Typography
                                fontSize={14}
                                translate={'no'}
                                textAlign={'right'}>
                                {data?.userAddress}
                            </Typography>
                        </Box>
                    </>
                )}
                <Box mb={2}>
                    <Typography
                        fontWeight={'bold'}
                        fontSize={15}
                        sx={{ my: 1 }}>
                        Payment Option{' '}
                        <span style={{ color: '#dc3545' }}>*</span>
                    </Typography>
                    <RadioGroup
                        value={paymentType || ''}
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            border: '1px solid #0000001f'
                        }}
                        onChange={(e) => {
                            setPaymentType(e.target.value);
                            setPaymentGateway(
                                gateways.find(
                                    (gateway) =>
                                        gateway.provider.code === e.target.value
                                )
                            );
                        }}>
                        <FormControlLabel
                            value={isBalanceChecked}
                            label={
                                <Box
                                    display={'flex'}
                                    justifyContent={'space-between'}
                                    alignItems={'center'}>
                                    <Typography fontSize={14}>
                                        Balance Payment
                                        <span
                                            translate={'no'}
                                            style={{
                                                display: isBalanceChecked
                                                    ? 'none'
                                                    : 'inline'
                                            }}>
                                            (
                                            {useStyledLocaleString(
                                                userBalance,
                                                user?.geoInfo
                                            )}
                                            )
                                        </span>
                                        <span
                                            translate={'no'}
                                            style={{
                                                display: isBalanceChecked
                                                    ? 'inline'
                                                    : 'none'
                                            }}>
                                            (
                                            {useStyledLocaleString(
                                                calculateWalletDiscount(
                                                    data?.totalPrice,
                                                    userBalance
                                                ).remainingBalance,
                                                user?.geoInfo
                                            )}
                                            )
                                        </span>
                                    </Typography>
                                    <Typography
                                        variant={'subtitle2'}
                                        translate={'no'}>
                                        -
                                        {isBalanceChecked
                                            ? useStyledLocaleString(
                                                  calculateWalletDiscount(
                                                      data?.totalPrice,
                                                      userBalance
                                                  ).discount,
                                                  user?.geoInfo
                                              )
                                            : useStyledLocaleString(
                                                  '0.00',
                                                  user?.geoInfo
                                              )}
                                    </Typography>
                                </Box>
                            }
                            control={<Checkbox />}
                            onChange={(e) =>
                                setIsBalanceChecked(e.target.checked)
                            }
                            sx={{
                                width: '100%',
                                '.MuiFormControlLabel-label': {
                                    width: '100%'
                                }
                            }}
                            disabled={
                                Number(userBalance) === 0 || !openingHours
                            }
                        />

                        {gateways.map((gateway) => {
                            if (gateway.blackList.includes(String(user.id)))
                                return;

                            return (
                                <Box key={gateway.id}>
                                    <Divider
                                        sx={{
                                            width: '90%',
                                            ml: '10%',
                                            mb: 1
                                        }}
                                    />
                                    <FormControlLabel
                                        value={gateway.provider.code}
                                        label={
                                            <Box>
                                                <Box
                                                    display={'flex'}
                                                    justifyContent={
                                                        'space-between'
                                                    }
                                                    alignItems={'flex-end'}
                                                    mt={1}>
                                                    <Box
                                                        display={'flex'}
                                                        alignItems={'flex-end'}>
                                                        {gateway.logo && (
                                                            <img
                                                                src={`${
                                                                    import.meta
                                                                        .env
                                                                        .VITE_API_BASE_URL
                                                                }/uploads/images/${
                                                                    gateway.logo
                                                                }`}
                                                                alt={
                                                                    gateway.name
                                                                }
                                                                style={{
                                                                    margin: '0 2px',
                                                                    objectFit:
                                                                        'contain',
                                                                    maxHeight:
                                                                        '1.5rem',
                                                                    minWidth:
                                                                        '1.5rem',
                                                                    verticalAlign:
                                                                        'top',
                                                                    width: 'auto'
                                                                }}
                                                            />
                                                        )}
                                                        <Typography
                                                            fontSize={14}
                                                            ml={1}>
                                                            {gateway.name}
                                                            <span
                                                                translate={'no'}
                                                                style={{
                                                                    color: '#d32f2f'
                                                                }}>
                                                                {Number(
                                                                    gateway.discount
                                                                ) > 0
                                                                    ? ` (-${gateway.discount}%)`
                                                                    : ''}
                                                            </span>
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        display={'flex'}
                                                        flexWrap={'wrap'}
                                                        justifyContent={
                                                            'flex-end'
                                                        }
                                                        alignItems={'flex-end'}>
                                                        {gateway.images.map(
                                                            (item, index) => (
                                                                <img
                                                                    key={index}
                                                                    src={`${
                                                                        import.meta
                                                                            .env
                                                                            .VITE_API_BASE_URL
                                                                    }/uploads/images/${item}`}
                                                                    alt={item}
                                                                    style={{
                                                                        margin: '0 4px',
                                                                        objectFit:
                                                                            'contain',
                                                                        maxHeight:
                                                                            '1.5rem',
                                                                        minWidth:
                                                                            '1rem',
                                                                        verticalAlign:
                                                                            'top',
                                                                        width: 'auto'
                                                                    }}
                                                                />
                                                            )
                                                        )}
                                                    </Box>
                                                </Box>
                                                <Box
                                                    mt={1}
                                                    display={'flex'}
                                                    flexWrap={'wrap'}>
                                                    {gateway.exLogos.map(
                                                        (item, index) => (
                                                            <img
                                                                key={index}
                                                                src={`${
                                                                    import.meta
                                                                        .env
                                                                        .VITE_API_BASE_URL
                                                                }/uploads/images/${item}`}
                                                                alt={item}
                                                                style={{
                                                                    margin: '0 4px',
                                                                    objectFit:
                                                                        'contain',
                                                                    maxHeight:
                                                                        '1.5rem',
                                                                    minWidth:
                                                                        '1rem',
                                                                    verticalAlign:
                                                                        'top',
                                                                    width: 'auto'
                                                                }}
                                                            />
                                                        )
                                                    )}
                                                </Box>
                                                {gateway.status ===
                                                'maintenance' ? (
                                                    <Box mb={1}>
                                                        {gateway.notices.map(
                                                            (notice, index) => (
                                                                <Typography
                                                                    key={index}
                                                                    fontSize={
                                                                        12
                                                                    }
                                                                    color={
                                                                        notice.color
                                                                    }
                                                                    mt={1}>
                                                                    {
                                                                        notice.text
                                                                    }
                                                                </Typography>
                                                            )
                                                        )}
                                                    </Box>
                                                ) : (
                                                    <Box mb={1}>
                                                        {gateway.notes.map(
                                                            (note, index) => (
                                                                <Typography
                                                                    key={index}
                                                                    fontSize={
                                                                        12
                                                                    }
                                                                    color={
                                                                        note.color
                                                                    }
                                                                    mt={1}>
                                                                    {note.text}
                                                                </Typography>
                                                            )
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        }
                                        control={<Radio />}
                                        sx={{
                                            width: '100%',
                                            '.MuiFormControlLabel-label': {
                                                width: '100%'
                                            },
                                            alignItems: 'flex-start'
                                        }}
                                        disabled={
                                            gateway.status !== 'active' ||
                                            isZero ||
                                            !openingHours
                                        }
                                    />
                                </Box>
                            );
                        })}
                    </RadioGroup>
                </Box>
                <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}>
                    <Typography fontSize={14}>Subtotal:</Typography>
                    <Typography
                        fontSize={14}
                        translate={'no'}
                        textAlign={'right'}>
                        {useStyledLocaleString(data?.subtotal, user?.geoInfo)}
                    </Typography>
                </Box>
                {siteData.deliveryFeeEnabled && (
                    <Box
                        display={'flex'}
                        justifyContent={'space-between'}
                        alignItems={'center'}>
                        <Typography fontSize={14}>Delivery Fee:</Typography>
                        <Typography
                            fontSize={14}
                            translate={'no'}
                            textAlign={'right'}>
                            {useStyledLocaleString(
                                data?.deliveryFee,
                                user?.geoInfo
                            )}
                        </Typography>
                    </Box>
                )}
                {siteData.vatEnabled && (
                    <Box
                        display={'flex'}
                        justifyContent={'space-between'}
                        alignItems={'center'}>
                        <Typography fontSize={14}>
                            Vat
                            <span translate={'no'}>
                                (
                                {data?.subtotal === 0
                                    ? '0.00'
                                    : (
                                          (data?.vat / data?.subtotal) *
                                          100
                                      ).toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2
                                      })}
                                %)
                            </span>
                            :
                        </Typography>
                        <Typography
                            fontSize={14}
                            translate={'no'}
                            textAlign={'right'}>
                            {useStyledLocaleString(data?.vat, user?.geoInfo)}
                        </Typography>
                    </Box>
                )}
                <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}>
                    <Typography fontSize={14}>Discount:</Typography>
                    <Typography
                        color={'error'}
                        fontWeight={'bold'}
                        translate={'no'}
                        textAlign={'right'}>
                        -
                        {useStyledLocaleString(
                            calculateWalletDiscount(
                                data?.totalPrice,
                                userBalance
                            ).totalDiscount,
                            user?.geoInfo
                        )}
                    </Typography>
                </Box>
                <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}>
                    <Typography fontSize={14}>Amount Due:</Typography>
                    <Typography
                        fontSize={19}
                        fontWeight={'bold'}
                        translate={'no'}
                        textAlign={'right'}>
                        <span
                            style={{
                                display:
                                    isBalanceChecked ||
                                    paymentGateway?.discount > 0
                                        ? 'inline'
                                        : 'none'
                            }}>
                            {useStyledLocaleString(
                                calculateWalletDiscount(
                                    data?.totalPrice,
                                    userBalance
                                ).payAmount,
                                user?.geoInfo
                            )}
                        </span>{' '}
                        {/* <span
                            style={{
                                textDecorationLine:
                                    isBalanceChecked || paymentGateway?.discount > 0
                                        ? 'line-through'
                                        : 'none',
                                display:
                                    isBalanceChecked || paymentGateway?.discount > 0
                                        ? 'inline'
                                        : 'none'
                            }}>
                            ({useStyledLocaleString(calculateWalletDiscount(
                                    data?.totalPrice,
                                    userBalance
                                ).payAmount, user?.geoInfo)})
                        </span> */}
                        <span
                            style={{
                                display:
                                    isBalanceChecked ||
                                    paymentGateway?.discount > 0
                                        ? 'none'
                                        : 'inline'
                            }}>
                            {useStyledLocaleString(
                                calculateWalletDiscount(
                                    data?.totalPrice,
                                    userBalance
                                ).payAmount,
                                user?.geoInfo
                            )}
                        </span>
                    </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography
                    fontSize={12}
                    textAlign={'center'}
                    color={'error'}
                    my={0.5}>
                    (Special event, you can get 10 points back when you spend
                    100 euros, and participate in the points event to receive
                    cash)
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Box
                    display={'flex'}
                    justifyContent={'flex-end'}
                    gap={1}
                    sx={{
                        bgcolor: '#fff',
                        width: '100%'
                    }}>
                    <Button
                        variant={'outlined'}
                        color={'action'}
                        size={'small'}
                        sx={{ textTransform: 'capitalize' }}
                        startIcon={
                            <CircularProgress
                                size={20}
                                sx={{
                                    color: '#fff',
                                    display: loadingLater ? 'inline' : 'none'
                                }}
                            />
                        }
                        onClick={() => {
                            setLoadingLater(true);
                            setTimeout(() => {
                                setLoadingLater(false);
                                setLoadingNow(false);
                                setUserBalance(null);
                                setIsBalanceChecked(false);
                                setIsZero(false);
                                setPaymentType('');
                                setOpen({ open: false, data: null });
                            }, 500);
                        }}
                        disabled={loadingLater}>
                        <span
                            style={{
                                display: loadingLater ? 'inline' : 'none'
                            }}>
                            Loading...
                        </span>
                        <span
                            style={{
                                display: loadingLater ? 'none' : 'inline'
                            }}>
                            Continue Shopping
                        </span>
                    </Button>
                    <Button
                        variant={'contained'}
                        color={'primary'}
                        size={'small'}
                        sx={{ textTransform: 'capitalize' }}
                        startIcon={
                            <CircularProgress
                                size={20}
                                sx={{
                                    color: '#fff',
                                    display: loadingNow ? 'inline' : 'none'
                                }}
                            />
                        }
                        onClick={handleOnPayClick}
                        disabled={loadingNow || !openingHours}>
                        <span
                            style={{ display: loadingNow ? 'inline' : 'none' }}>
                            Submitting...
                        </span>
                        <span
                            style={{ display: loadingNow ? 'none' : 'inline' }}>
                            Confirm Order
                        </span>
                    </Button>
                </Box>
            </Box>
            <ModalPaymentCheckout
                open={openPayment.open}
                data={openPayment.data}
                setOpen={setOpenPayment}
                paymentType={paymentType}
                gateway={paymentGateway}
            />
        </Dialog>
    );
};

export default ModalOrderCheckout;
