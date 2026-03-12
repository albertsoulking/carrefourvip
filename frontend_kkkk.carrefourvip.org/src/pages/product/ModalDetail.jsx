import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    Typography
} from '@mui/material';
import {
    AddRounded,
    DeleteRounded,
    RestaurantRounded
} from '@mui/icons-material';
import api from '../../routes/api';
import ReactQuill from 'react-quill';
import usePermissionStore from '../../hooks/usePermissionStore';
import { enqueueSnackbar } from 'notistack';
import UploadImageBox from '../../components/UploadImageBox';

export default function ModalDetail({ open, setOpen, data }) {
    const permissions = usePermissionStore((state) => state.permissions);
    const [imageList, setImageList] = useState([]);
    const [categoriesData, setCategoriesData] = useState([]);
    const [formData, setFormData] = useState({});
    const [attributes, setAttributes] = useState([]);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        if (!open) return;

        loadCategory();
        setFormData(data ? { ...data, categoryId: data.category.id } : {});
        setImageList(data.imageList ? data.imageList.split(',') : []);
        setAttributes(JSON.parse(data.attributes || '[]'));
        setGroups(JSON.parse(data.attrGroups || '[]'));
    }, [open]);

    const loadCategory = async () => {
        const res = await api.category.get();
        setCategoriesData(res.data);
    };

    const handleOnClose = () => {
        setOpen(false);
        setFormData({});
        setAttributes([]);
        setGroups([]);
    };

    const handleOnSave = async () => {
        const { createdAt, soldCount, category, ...productData } = formData;

        const payload = {
            ...productData,
            imageList: imageList.join(','),
            attrGroups: JSON.stringify(groups),
            attributes: JSON.stringify(attributes)
        };

        try {
            await api.product.update(payload);
            handleOnClose();
            enqueueSnackbar('更新成功!', {
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

    const handleInputChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value || ''
        }));
    };

    const handleGroupChange = (event, index) => {
        const { name, value } = event.target;

        setGroups((prev) => {
            const newGroups = [...prev];
            newGroups[index] = {
                ...newGroups[index],
                [name]: value || ''
            };
            return newGroups;
        });

        setAttributes((prev) => {
            const newAttr = [...prev];
            return newAttr.map((attr) => ({
                ...attr,
                variants: attr.variants.map((v, vIdx) => {
                    if (vIdx !== index) return v;

                    return { ...v, [name]: value || '' };
                })
            }));
        });
    };

    const handleAttributeChange = (event, index) => {
        const { name, value } = event.target;
        setAttributes((prev) => {
            const newAttr = [...prev];
            newAttr[index] = {
                ...newAttr[index],
                [name]: value || ''
            };
            return newAttr;
        });
    };

    const handleVariantChange = (event, index, vIdx) => {
        const { name, value } = event.target;

        setAttributes((prev) => {
            const newAttr = [...prev];
            const parent = { ...newAttr[index] };

            const variants = [...(parent.variants || [])];
            const item = { ...variants[vIdx] };
            item[name] = value || '';

            variants[vIdx] = item;
            parent.variants = variants;
            newAttr[index] = parent;

            return newAttr;
        });
    };

    const clean = (obj) => {
        const keepKeys = ['code', 'name'];
        const dynamicKey = obj.code;

        // 如果 obj 里有 dynamicKey，那也加入保留
        if (dynamicKey && obj.hasOwnProperty(dynamicKey)) {
            keepKeys.push(dynamicKey);
        }

        return Object.fromEntries(
            Object.entries(obj).filter(([k]) => keepKeys.includes(k))
        );
    };

    return (
        <Dialog
            open={open}
            maxWidth={'xl'}
            fullWidth
            container={document.body}
            disablePortal={false}
            aria-labelledby={'view-product-dialog-title'}>
            <DialogTitle
                id={'view-product-dialog-title'}
                sx={{
                    pb: 1,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiSvgIcon-root': { mr: 1 }
                }}>
                <RestaurantRounded color={'primary'} /> 商品详情
            </DialogTitle>
            <DialogContent
                dividers
                sx={{ display: 'flex', gap: 2 }}>
                <Box
                    display={'flex'}
                    flexDirection={'column'}
                    minWidth={300}
                    maxWidth={300}
                    mb={2}>
                    <UploadImageBox
                        width={300}
                        height={200}
                        value={formData.imageUrl}
                        onChange={async (file) => {
                            if (file) {
                                const imageData = new FormData();
                                imageData.append('file', file);

                                const res = await api.utilities.upload(
                                    imageData
                                );
                                setFormData((prev) => ({
                                    ...prev,
                                    imageUrl: res.data.name
                                }));
                            } else {
                                setFormData((prev) => ({
                                    ...prev,
                                    imageUrl: ''
                                }));
                            }
                        }}
                    />
                    <Box
                        display={'flex'}
                        flexWrap={'wrap'}
                        gap={1}
                        mt={1}>
                        {imageList.map((img, index) => (
                            <UploadImageBox
                                key={index}
                                width={90}
                                height={90}
                                value={img}
                                onChange={async (file) => {
                                    if (file) return;

                                    setImageList((prev) =>
                                        prev.filter((_, i) => i !== index)
                                    );
                                }}
                            />
                        ))}
                        <UploadImageBox
                            width={90}
                            height={90}
                            onChange={async (file) => {
                                const imageData = new FormData();
                                imageData.append('file', file);

                                const res = await api.utilities.upload(
                                    imageData
                                );
                                setImageList((prev) => [
                                    ...prev,
                                    res.data.name
                                ]);
                            }}
                        />
                    </Box>
                </Box>
                <Box
                    display={'flex'}
                    flexDirection={'column'}
                    width={'100%'}>
                    <TextField
                        fullWidth
                        margin={'normal'}
                        label={'名称'}
                        name={'name'}
                        size={'small'}
                        value={formData.name || ''}
                        onChange={(e) =>
                            handleInputChange(e.target.name, e.target.value)
                        }
                        required
                    />
                    <FormControl
                        fullWidth
                        margin={'normal'}>
                        <InputLabel>分类 *</InputLabel>
                        <Select
                            name={'categoryId'}
                            value={
                                categoriesData.length > 0 &&
                                categoriesData.some(
                                    (c) => c.id === formData.categoryId
                                )
                                    ? formData.categoryId
                                    : ''
                            }
                            onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                            }
                            label={'分类 *'}
                            size={'small'}
                            required>
                            {categoriesData.map((category) => (
                                <MenuItem
                                    key={category.id}
                                    value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <ReactQuill
                        theme={'snow'}
                        style={{ height: 400, marginTop: 16 }}
                        value={formData.description || ''}
                        onChange={(newValue) =>
                            handleInputChange('description', newValue)
                        }
                    />
                    <Box mt={8}>
                        <Typography>属性分组</Typography>
                        <Typography
                            fontSize={12}
                            color={'error'}>
                            * 代号仅英文小写不能有空格且唯一 *
                        </Typography>
                        <Box
                            display={'flex'}
                            flexDirection={'column'}
                            mt={1}
                            gap={1}>
                            {groups.map((g, index) => (
                                <Box
                                    display={'flex'}
                                    gap={1}>
                                    <TextField
                                        name={'code'}
                                        label={`代号`}
                                        value={g.code || ''}
                                        size={'small'}
                                        onChange={(e) =>
                                            handleGroupChange(e, index)
                                        }
                                    />
                                    <TextField
                                        name={'name'}
                                        label={`名称`}
                                        value={g.name || ''}
                                        size={'small'}
                                        onChange={(e) =>
                                            handleGroupChange(e, index)
                                        }
                                    />
                                    <IconButton
                                        onClick={() => {
                                            setGroups((prev) =>
                                                prev.filter(
                                                    (_, i) => i !== index
                                                )
                                            );
                                            setAttributes((prev) => {
                                                const newAttr = [...prev];
                                                return newAttr.map((attr) => ({
                                                    ...attr,
                                                    variants:
                                                        attr.variants.filter(
                                                            (_, i) =>
                                                                i !== index
                                                        )
                                                }));
                                            });
                                        }}>
                                        <DeleteRounded />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                variant={'outlined'}
                                size={'small'}
                                startIcon={<AddRounded />}
                                sx={{ textTransform: 'capitalize' }}
                                onClick={() => {
                                    setGroups((prev) => [
                                        ...prev,
                                        {
                                            code: '',
                                            name: ''
                                        }
                                    ]);
                                    setAttributes((prev) => {
                                        const newAttr = [...prev];
                                        return newAttr.map((attr) => ({
                                            ...attr,
                                            variants: [
                                                ...attr.variants,
                                                { code: '', name: '' }
                                            ]
                                        }));
                                    });
                                }}>
                                添加属性分组
                            </Button>
                        </Box>
                    </Box>
                    <Box mt={2}>
                        <Typography>属性变体</Typography>
                        <Box
                            display={'flex'}
                            flexDirection={'column'}
                            gap={1}
                            mt={1}>
                            {attributes.map((attr, index) => (
                                <Box
                                    key={index}
                                    display={'flex'}
                                    gap={1}>
                                    <UploadImageBox
                                        height={40}
                                        width={40}
                                        value={attr.image}
                                        onChange={async (file) => {
                                            if (file) {
                                                const imageData =
                                                    new FormData();
                                                imageData.append('file', file);

                                                const res =
                                                    await api.utilities.upload(
                                                        imageData
                                                    );
                                                setAttributes((prev) => {
                                                    const newAttr = [...prev];
                                                    newAttr[index] = {
                                                        ...newAttr[index],
                                                        image: res.data.name
                                                    };
                                                    return newAttr;
                                                });
                                            } else {
                                                setAttributes((prev) => {
                                                    const newAttr = [...prev];
                                                    newAttr[index] = {
                                                        ...newAttr[index],
                                                        image: ''
                                                    };
                                                    return newAttr;
                                                });
                                            }
                                        }}
                                    />
                                    {attr.variants.map(clean).map((v, vIdx) => (
                                        <TextField
                                            key={`${index}-${vIdx}`}
                                            name={v.code}
                                            label={v.name}
                                            size={'small'}
                                            value={v[v.code] || ''}
                                            onChange={(e) =>
                                                handleVariantChange(
                                                    e,
                                                    index,
                                                    vIdx
                                                )
                                            }
                                        />
                                    ))}
                                    <TextField
                                        name={'price'}
                                        label={'价格'}
                                        value={attr.price || ''}
                                        size={'small'}
                                        type={'number'}
                                        onChange={(e) =>
                                            handleAttributeChange(e, index)
                                        }
                                    />
                                    <IconButton
                                        onClick={() =>
                                            setAttributes((prev) =>
                                                prev.filter(
                                                    (_, i) => i !== index
                                                )
                                            )
                                        }>
                                        <DeleteRounded />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                variant={'outlined'}
                                startIcon={<AddRounded />}
                                size={'small'}
                                onClick={() =>
                                    setAttributes((prev) => [
                                        ...prev,
                                        {
                                            image: '',
                                            price: '',
                                            variants: groups
                                        }
                                    ])
                                }>
                                添加属性变体
                            </Button>
                        </Box>
                    </Box>
                    <TextField
                        label={'基价'}
                        name={'price'}
                        type={'number'}
                        value={formData.price || ''}
                        onChange={(e) =>
                            handleInputChange(e.target.name, e.target.value)
                        }
                        required
                        fullWidth
                        size={'small'}
                        margin={'normal'}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position='start'>
                                    €
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleOnClose}
                    variant={'outlined'}
                    color={'error'}
                    sx={{ width: 100 }}>
                    取消
                </Button>
                {permissions.includes('product.edit') && (
                    <Button
                        onClick={handleOnSave}
                        variant={'contained'}
                        sx={{ width: 100 }}>
                        保存更改
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
