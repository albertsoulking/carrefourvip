import {
    Drawer,
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import { useState } from 'react';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import { RemoveRounded, AddRounded } from '@mui/icons-material';
import { useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';
import ModalViewImage from './ModalViewImage';
import api from '../../routes/api';

const safeParseArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Invalid attribute JSON:', error);
        return [];
    }
};

const getVariantLabel = (variant) => {
    if (!variant?.code) return '';
    return variant[variant.code] ?? '';
};

export default function DrawerAttribute({ open, data, setOpen }) {
    const user = JSON.parse(localStorage.getItem('user'));
    const [quantity, setQuantity] = useState(1);
    const [selectedAttr, setSelectedAttr] = useState({});
    const [attrGroups, setAttrGroups] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openImage, setOpenImage] = useState(false);
    const [disabledAttr, setDisabledAttr] = useState([]);

    useEffect(() => {
        const attrs = safeParseArray(data?.attributes).filter((attr) =>
            Array.isArray(attr?.variants)
        );
        const groups = safeParseArray(data?.attrGroups).filter((group) => group?.code);
        setAttributes(attrs);
        setAttrGroups(groups);
        setSelectedAttr(attrs.length > 0 ? attrs[0] : {});
        setQuantity(1);
        setDisabledAttr([]);
    }, [open]);

    const handleOnAddToCart = async () => {
        const payload = {
            productId: data?.id,
            imageUrl: selectedAttr?.image
                ? selectedAttr.image
                : data?.attributes
                ? data.imageUrl
                : data?.imageUrl,
            quantity,
            attributes: JSON.stringify(selectedAttr),
            basePrice: data?.price,
            attrPrice: getAttrPrice(),
            unitPrice: getUnitPrice(),
            totalPrice: getTotalPrice()
        };

        setLoading(true);
        setOpen(false);
        setSelectedAttr({});
        setDisabledAttr([]);

        try {
            await api.carts.createOne(payload);

            setTimeout(async () => {
                setLoading(false);
                enqueueSnackbar('Added to cart!', { variant: 'success' });
            }, 500);
        } catch (error) {
            setLoading(false);
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

    const getValuesByCode = (code) => {
        return [
            ...new Set(
                attributes
                    .map((p) => {
                        const variant = (p.variants || []).find((v) => v.code === code);
                        return variant ? variant[code] : null;
                    })
                    .filter(Boolean) // 去掉 null/undefined
            )
        ];
    };

    const getAttrPrice = () => {
        const attrPrice = selectedAttr.price || 0;
        return attrPrice.toString();
    };

    const getUnitPrice = () => {
        const unitPrice = Number(data?.price || 0) + Number(getAttrPrice());
        return unitPrice.toString();
    };

    const getTotalPrice = () => {
        const totalPrice = quantity * Number(getUnitPrice());
        return totalPrice.toString();
    };

    const isOptionDisabled = (val) =>
        disabledAttr.length > 0 && !disabledAttr.includes(val);

    const handleSelectOption = (g, val) => {
        if (isOptionDisabled(val)) return;

        setSelectedAttr((prev) => {
            const variants = (prev.variants || []).map((v) =>
                g.code === v.code
                    ? {
                          ...v,
                          [v.code]: val
                      }
                    : v
            );

            const selected = Object.fromEntries(
                variants
                    .map((v) => [v.code, getVariantLabel(v)])
                    .filter(([_, value]) => !!value)
            );

            const found = attributes.find((attr) =>
                Object.entries(selected).every(([code, value]) =>
                    (attr.variants || []).some(
                        (v) => v.code === code && getVariantLabel(v) === value
                    )
                )
            );

            return (
                found ??
                attributes.find((attr) =>
                    (attr.variants || []).some(
                        (v) => v.code === g.code && getVariantLabel(v) === val
                    )
                ) ??
                prev
            );
        });

        const firstGroupCode = attrGroups[0]?.code;
        const mainOpts = firstGroupCode ? getValuesByCode(firstGroupCode) : [];

        setDisabledAttr([
            ...new Set([
                ...attributes
                    .filter((attr) =>
                        (attr.variants || []).some(
                            (v) => v.code === g.code && getVariantLabel(v) === val
                        )
                    )
                    .flatMap((attr) =>
                        (attr.variants || []).map((v) => getVariantLabel(v))
                    )
                    .filter(Boolean),
                ...mainOpts
            ])
        ]);
    };

    return (
        <Drawer
            open={open}
            anchor={'bottom'}
            onClose={() => setOpen(false)}
            sx={{ '.MuiDrawer-paper': { bgcolor: 'transparent' } }}>
            <Box
                maxHeight={'86vh'}
                bgcolor={'var(--brand-paper)'}
                position={'relative'}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderTopLeftRadius: 'var(--brand-radius-lg)',
                    borderTopRightRadius: 'var(--brand-radius-lg)',
                    border: '1px solid var(--brand-line)',
                    overflow: 'hidden'
                }}>
                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        borderBottom: '1px solid var(--brand-line)'
                    }}>
                    <Typography
                        textAlign={'center'}
                        fontWeight={800}>
                        Choose Options
                    </Typography>
                </Box>
                <Box
                    sx={{
                        overflow: 'auto',
                        px: 2,
                        py: 2,
                        pb: 1
                    }}>
                <Box display={'flex'} gap={1.5}>
                    <Box
                        component={'img'}
                        src={`${
                            import.meta.env.VITE_API_BASE_URL
                        }/uploads/thumbs/${
                            selectedAttr.image || data?.imageUrl
                        }`}
                        width={100}
                        height={100}
                        sx={{
                            objectFit: 'cover',
                            borderRadius: 'var(--brand-radius-md)',
                            border: '1px solid var(--brand-line)',
                            cursor: 'zoom-in'
                        }}
                        onClick={() => setOpenImage(true)}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            fontSize={26}
                            fontWeight={'bold'}
                            translate={'no'}
                            width={'fit-content'}>
                            {useStyledLocaleString(
                                getTotalPrice(),
                                user?.geoInfo
                            )}
                        </Typography>
                        <Typography fontSize={14}>
                            Choose:{' '}
                            {selectedAttr.variants
                                ?.map((v) => getVariantLabel(v))
                                .filter(Boolean)
                                .join(', ') || 'Default Selection'}
                        </Typography>
                        <Box
                            display={'flex'}
                            alignItems={'center'}
                            justifyContent={'space-around'}
                            border={'1px solid var(--brand-line)'}
                            borderRadius={'var(--brand-radius-md)'}
                            width={'fit-content'}
                            mt={1}>
                            <IconButton
                                size={'small'}
                                onClick={() =>
                                    setQuantity((prev) => Math.max(1, prev - 1))
                                }
                                disabled={quantity === 1}>
                                <RemoveRounded />
                            </IconButton>
                            <TextField
                                translate={'no'}
                                value={quantity}
                                variant={'standard'}
                                type={'number'}
                                inputProps={{
                                    style: {
                                        textAlign: 'center',
                                        width: 26,
                                        padding: 0
                                    }
                                }}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val >= 1)
                                        setQuantity(
                                            Math.max(1, Math.min(99, val))
                                        );
                                }}
                            />
                            <IconButton
                                size={'small'}
                                onClick={() =>
                                    setQuantity((prev) =>
                                        Math.min(99, prev + 1)
                                    )
                                }>
                                <AddRounded />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
                <Box mt={2}>
                    {attrGroups.map((g, index) => {
                        const options = getValuesByCode(g.code);
                        
                        return (
                            <Box
                                key={g.code}
                                mt={2}>
                                <Typography
                                    fontSize={18}
                                    mb={1}>
                                    {g.name}
                                </Typography>
                                <ToggleButtonGroup
                                    exclusive
                                    value={
                                        selectedAttr.variants?.find(
                                            (v) => v.code === g.code
                                        )?.[g.code] || null
                                    }
                                    onChange={(event, nextValue) => {
                                        if (nextValue === null) return;
                                        handleSelectOption(g, nextValue);
                                    }}
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1,
                                        '& .MuiToggleButton-root': {
                                            border: '1px solid var(--brand-line)',
                                            borderRadius:
                                                'var(--brand-radius-md) !important',
                                            px: 1.5,
                                            py: 0.75,
                                            color: 'var(--brand-ink)',
                                            bgcolor: 'var(--brand-cream)',
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            '&.Mui-selected': {
                                                color: '#fff',
                                                bgcolor: 'var(--brand-forest)',
                                                borderColor: 'var(--brand-forest)',
                                                '&:hover': {
                                                    bgcolor: 'var(--brand-forest)'
                                                }
                                            },
                                            '&.Mui-disabled': {
                                                color: 'var(--brand-muted)',
                                                opacity: 0.42
                                            }
                                        }
                                    }}>
                                    {options.map((val, oIdx) => (
                                        <ToggleButton
                                            key={`${index}-${oIdx}`}
                                            value={val}
                                            disabled={isOptionDisabled(val)}>
                                            {val}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </Box>
                        );
                    })}
                    {attrGroups.length === 0 ? (
                        <Typography
                            sx={{
                                mt: 2,
                                color: 'var(--brand-muted)',
                                fontSize: 13
                            }}>
                            This product has no extra options.
                        </Typography>
                    ) : null}
                </Box>
                </Box>
                <Button
                    variant={'contained'}
                    fullWidth
                    size={'large'}
                    sx={{
                        position: 'sticky',
                        bottom: 0,
                        textTransform: 'capitalize',
                        m: 2,
                        width: 'auto',
                        py: 1.25,
                        borderRadius: 'var(--brand-radius-md)'
                    }}
                    onClick={handleOnAddToCart}>
                    {loading ? (
                        <CircularProgress
                            size={'small'}
                            sx={{
                                width: '24px !important',
                                height: '24px !important',
                                color: '#fff'
                            }}
                        />
                    ) : (
                        <span>Confirm</span>
                    )}
                </Button>
            </Box>
            <ModalViewImage
                open={openImage}
                image={selectedAttr.image || data?.imageUrl}
                setOpen={setOpenImage}
            />
        </Drawer>
    );
}
