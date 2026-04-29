import {
    Drawer,
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    CircularProgress
} from '@mui/material';
import { useState } from 'react';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import { RemoveRounded, AddRounded } from '@mui/icons-material';
import { useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';
import ModalViewImage from './ModalViewImage';
import api from '../../routes/api';

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
        const attrs = JSON.parse(data?.attributes || '[]');
        const groups = JSON.parse(data?.attrGroups || '[]');
        setAttributes(attrs);
        setAttrGroups(groups);
        setSelectedAttr(attrs.length > 0 ? attrs[0] : {});
    }, [open]);

    const handleOnAddToCart = async () => {
        const payload = {
            productId: data?.id,
            imageUrl: selectedAttr?.image
                ? selectedAttr.image
                : data?.attributes
                ? data.imageUrl
                : null,
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
                        const variant = p.variants.find((v) => v.code === code);
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

    return (
        <Drawer
            open={open}
            anchor={'bottom'}
            onClose={() => setOpen(false)}
            sx={{ '.MuiDrawer-paper': { bgcolor: 'transparent' } }}>
            <Box
                height={600}
                bgcolor={'#fff'}
                p={2}
                position={'relative'}
                sx={{
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16
                }}>
                <Typography textAlign={'center'}>Choose Options</Typography>
                <Box display={'flex'}>
                    <Box
                        component={'img'}
                        src={`${
                            import.meta.env.VITE_API_BASE_URL
                        }/uploads/thumbs/${
                            selectedAttr.image || data?.imageUrl
                        }`}
                        width={100}
                        height={100}
                        borderRadius={2}
                        sx={{ objectFit: 'cover' }}
                        onClick={() => setOpenImage(true)}
                    />
                    <Box ml={2}>
                        <Typography
                            fontSize={30}
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
                                ?.map((v) => v[v.code])
                                .join(', ') || 'Default Selection'}
                        </Typography>
                        <Box
                            display={'flex'}
                            alignItems={'center'}
                            justifyContent={'space-around'}
                            border={'1px solid #ccc'}
                            borderRadius={2}
                            width={'fit-content'}>
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
                        const mainOpts = getValuesByCode(attrGroups[0].code);
                        
                        return (
                            <Box
                                key={g.code}
                                mt={2}>
                                <Typography
                                    fontSize={18}
                                    mb={1}>
                                    {g.name}
                                </Typography>
                                <Box
                                    display={'flex'}
                                    flexWrap={'wrap'}
                                    gap={1}>
                                    {options.map((val, oIdx) => (
                                        <Typography
                                            key={`${index}-${oIdx}`}
                                            sx={{
                                                color:
                                                    disabledAttr.length > 0
                                                        ? disabledAttr.includes(
                                                              val
                                                          )
                                                            ? '#000'
                                                            : '#c5c5c5'
                                                        : '#000',
                                                bgcolor: '#f1f1f7',
                                                py: 0.5,
                                                px: 2,
                                                borderRadius: 2,
                                                width: 'fit-content',
                                                cursor: 'pointer',
                                                border: selectedAttr.variants?.some(
                                                    (v) =>
                                                        v.code === g.code &&
                                                        v[v.code] === val
                                                )
                                                    ? '1px solid #1890ff'
                                                    : '1px solid #f1f1f7',
                                                ':hover': {
                                                    border:
                                                        disabledAttr.length > 0
                                                            ? disabledAttr.includes(
                                                                  val
                                                              )
                                                                ? '1px solid #1976d2'
                                                                : '1px solid #f1f1f7'
                                                            : '1px solid #1976d2'
                                                }
                                            }}
                                            onClick={() => {
                                                if (
                                                    disabledAttr.length > 0
                                                        ? disabledAttr.includes(
                                                              val
                                                          )
                                                            ? false
                                                            : true
                                                        : false
                                                )
                                                    return;

                                                setSelectedAttr((prev) => {
                                                    const variants =
                                                        prev.variants.map((v) =>
                                                            g.code === v.code
                                                                ? {
                                                                      ...v,
                                                                      [v.code]:
                                                                          val
                                                                  }
                                                                : v
                                                        );

                                                    // 当前选择的条件（去掉空值）
                                                    const selected =
                                                        Object.fromEntries(
                                                            variants
                                                                .map((v) => [
                                                                    v.code,
                                                                    v[v.code]
                                                                ])
                                                                .filter(
                                                                    ([
                                                                        _,
                                                                        val
                                                                    ]) => !!val
                                                                )
                                                        );

                                                    // 精确匹配：找出 variants 里所有 code 都符合 selected 的 attr
                                                    const found =
                                                        attributes.find(
                                                            (attr) =>
                                                                Object.entries(
                                                                    selected
                                                                ).every(
                                                                    ([
                                                                        code,
                                                                        value
                                                                    ]) =>
                                                                        attr.variants.some(
                                                                            (
                                                                                v
                                                                            ) =>
                                                                                v.code ===
                                                                                    code &&
                                                                                v[
                                                                                    v
                                                                                        .code
                                                                                ] ===
                                                                                    value
                                                                        )
                                                                )
                                                        );

                                                    return (
                                                        found ??
                                                        attributes.find(
                                                            (attr) =>
                                                                attr.variants.some(
                                                                    (v) =>
                                                                        v.code ===
                                                                            g.code &&
                                                                        v[
                                                                            v
                                                                                .code
                                                                        ] ===
                                                                            val
                                                                )
                                                        )
                                                    ); // 没找到就查找到匹配的第一个数据
                                                });

                                                setDisabledAttr([
                                                    ...new Set([
                                                        ...attributes
                                                            .filter((attr) =>
                                                                attr.variants.some(
                                                                    (v) =>
                                                                        v.code ===
                                                                            g.code &&
                                                                        v[
                                                                            v
                                                                                .code
                                                                        ] ===
                                                                            val
                                                                )
                                                            )
                                                            .flatMap((attr) =>
                                                                attr.variants.map(
                                                                    (v) =>
                                                                        v[
                                                                            v
                                                                                .code
                                                                        ]
                                                                )
                                                            ),
                                                        ...mainOpts
                                                    ])
                                                ]);
                                                // setSelected((prev) => {
                                                //     const isMulti = false;

                                                //     if (isMulti) {
                                                //         // 多选
                                                //         const exists = prev.some(
                                                //             (p) =>
                                                //                 p.attrIndex === index &&
                                                //                 p.itemIndex === oIdx
                                                //         );
                                                //         if (exists) {
                                                //             // 如果已存在就删掉（toggle 效果）
                                                //             return prev.filter(
                                                //                 (p) =>
                                                //                     !(
                                                //                         p.attrIndex ===
                                                //                             index &&
                                                //                         p.itemIndex ===
                                                //                             oIdx
                                                //                     )
                                                //             );
                                                //         }
                                                //         return [
                                                //             ...prev,
                                                //             {
                                                //                 attrIndex: index,
                                                //                 itemIndex: oIdx,
                                                //                 itemPrice: Number(
                                                //                     item.price
                                                //                 )
                                                //             }
                                                //         ];
                                                //     } else {
                                                //         // 单选：清空同 attrIndex 的旧值，加入新的
                                                //         return [
                                                //             ...prev.filter(
                                                //                 (p) => p.attrIndex !== index
                                                //             ),
                                                //             {
                                                //                 attrIndex: index,
                                                //                 itemIndex: oIdx,
                                                //                 itemPrice: Number(
                                                //                     item.price
                                                //                 )
                                                //             }
                                                //         ];
                                                //     }
                                                // });
                                                // setSelectedImage(item.image);
                                            }}>
                                            {val}
                                        </Typography>
                                    ))}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
                <Button
                    variant={'contained'}
                    fullWidth
                    size={'large'}
                    sx={{
                        position: 'sticky',
                        bottom: 0,
                        textTransform: 'capitalize',
                        mt: 2,
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
                image={selectedAttr.image}
                setOpen={setOpenImage}
            />
        </Drawer>
    );
}
