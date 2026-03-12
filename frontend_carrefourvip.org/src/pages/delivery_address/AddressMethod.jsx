import {
    Box,
    IconButton,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';
import { CloseRounded, CircleRounded } from '@mui/icons-material';
import assets from '../../assets';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';

const AddressMethod = ({
    data,
    selectedIds,
    setOpen,
    setUserSelectedManually,
    user,
    shippingFee,
    setShippingFee,
    deliveryData
}) => {
    const shippingTypeOptions = [
        {
            label: 'Standard Delivery',
            value: 'standard',
            rule: (rule) => '1-2 days delivery.',
            rule1: (rule) =>
                `For orders under €${rule.maxStandard}, a fixed delivery fee of €${rule.feeStandard}.`,
            rule2: (rule) =>
                `For orders between €${rule.minAdvanced} and €${rule.maxAdvanced}, a fixed delivery fee of €${rule.feeAdvanced}.`,
            rule3: (rule) => `For orders over €${rule.minFree}, free delivery.`
        },
        {
            label: 'Express Delivery',
            value: 'express',
            rule: (rule) =>
                `minimum order of €${rule.minStandard}, delivery in 30 minutes.`,
            rule1: (rule) =>
                `For orders under €${rule.maxStandard}, a fixed delivery fee of €${rule.feeStandard}.`,
            rule2: (rule) =>
                `For orders between €${rule.minAdvanced} and €${rule.maxAdvanced}, a fixed delivery fee of €${rule.feeAdvanced}.`,
            rule3: (rule) => `For orders over €${rule.minFree}, free delivery.`
        }
    ];

    const getDeliveryFee = (type) => {
        if (!type) return;
        if (!deliveryData) return;

        const deliveryRules = normalizeArray(deliveryData.deliveryRules);
        console.log(deliveryData)
        if (deliveryRules.length === 0) return;

        const rule = deliveryRules.find((r) => r.code === type);
        
        const subtotal = data
            .filter((item) => selectedIds.includes(item.id))
            .reduce(
                (sum, curr) => sum + curr.quantity * Number(curr.product.price),
                0
            );

        let fees = 0;
        let isExpress = subtotal < Number(rule.minStandard);

        if (
            subtotal >= Number(rule.minStandard) &&
            subtotal < Number(rule.maxStandard) + 1
        ) {
            fees = Number(rule.feeStandard);
        } else if (
            subtotal >= Number(rule.minAdvanced) &&
            subtotal < Number(rule.maxAdvanced) + 1
        ) {
            fees = rule.feeAdvanced;
        } else if (subtotal >= Number(rule.minFree)) {
            fees = rule.feeFree;
        }

        return { fees, isExpress, rule };
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

    return (
        <Box sx={{ pb: 1 }}>
            <Box
                display={'flex'}
                flexDirection={'row'}
                alignItems={'center'}
                justifyContent={'space-between'}
                my={2}>
                <IconButton
                    color={'error'}
                    onClick={() => setOpen(false)}>
                    <CloseRounded />
                </IconButton>
                <Typography>Delivery Method</Typography>
                <IconButton
                    color={'warning'}
                    disabled={true}>
                    <CloseRounded sx={{ color: '#fff' }} />
                </IconButton>
            </Box>
            <Box sx={{ px: 1 }}>
                <RadioGroup
                    value={shippingFee.type}
                    onChange={(e) => {
                        setShippingFee({
                            ...shippingFee,
                            type: e.target.value
                        });
                        setUserSelectedManually(true);
                    }}
                    onClick={() => setOpen(false)}>
                    {shippingTypeOptions.map((opt) => (
                        <Box
                            key={opt.value}
                            sx={{
                                mb: 1,
                                p: 1,
                                width: '100%',
                                border: '1px solid #1976d2',
                                borderRadius: 2
                            }}>
                            <FormControlLabel
                                key={opt.value}
                                value={opt.value}
                                control={<Radio />}
                                label={
                                    <Box
                                        display={'flex'}
                                        justifyContent={'space-between'}
                                        width={'100%'}>
                                        <Box
                                            display={'flex'}
                                            alignItems={'center'}>
                                            <img
                                                src={assets.express}
                                                alt={'express'}
                                                style={{
                                                    height: 15,
                                                    objectFit: 'contain',
                                                    display:
                                                        opt.value ===
                                                        'express_rule'
                                                            ? 'inline'
                                                            : 'none'
                                                }}
                                                translate={'no'}
                                            />
                                            <Typography
                                                variant={'subtitle2'}
                                                ml={1}>
                                                {opt.label}
                                            </Typography>
                                        </Box>
                                        <Typography variant={'subtitle2'}>
                                            {console.log(opt.value)}
                                            {getDeliveryFee(opt.value).fees ===
                                            0 ? (
                                                <span>FREE</span>
                                            ) : (
                                                <span translate={'no'}>
                                                    {useStyledLocaleString(
                                                        getDeliveryFee(
                                                            opt.value
                                                        ).fees,
                                                        user?.geoInfo
                                                    )}
                                                </span>
                                            )}
                                        </Typography>
                                    </Box>
                                }
                                sx={{
                                    width: '100%',
                                    '.MuiFormControlLabel-label': {
                                        width: '100%'
                                    }
                                }}
                                disabled={getDeliveryFee(opt.value).isExpress}
                            />
                            <Typography
                                variant={'subtitle2'}
                                color={
                                    getDeliveryFee(opt.value).isExpress
                                        ? 'textDisabled'
                                        : ''
                                }>
                                <CircleRounded sx={{ fontSize: 8, mr: 0.5 }} />
                                {opt.rule(getDeliveryFee(opt.value).rule)}
                            </Typography>
                            <Typography
                                variant={'subtitle2'}
                                color={
                                    getDeliveryFee(opt.value).isExpress
                                        ? 'textDisabled'
                                        : ''
                                }>
                                <CircleRounded sx={{ fontSize: 8, mr: 0.5 }} />
                                {opt.rule1(getDeliveryFee(opt.value).rule)}
                            </Typography>
                            <Typography
                                variant={'subtitle2'}
                                color={
                                    getDeliveryFee(opt.value).isExpress
                                        ? 'textDisabled'
                                        : ''
                                }>
                                <CircleRounded sx={{ fontSize: 8, mr: 0.5 }} />
                                {opt.rule2(getDeliveryFee(opt.value).rule)}
                            </Typography>
                            <Typography
                                variant={'subtitle2'}
                                color={
                                    getDeliveryFee(opt.value).isExpress
                                        ? 'textDisabled'
                                        : ''
                                }>
                                <CircleRounded sx={{ fontSize: 8, mr: 0.5 }} />
                                {opt.rule3(getDeliveryFee(opt.value).rule)}
                            </Typography>
                        </Box>
                    ))}
                </RadioGroup>
            </Box>
        </Box>
    );
};

export default AddressMethod;
