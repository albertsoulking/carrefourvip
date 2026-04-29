import {
    Card,
    Typography,
    Box,
    CardActionArea,
    IconButton
} from '@mui/material';
import { DeleteRounded } from '@mui/icons-material';
import api from '../../routes/api';
import web from '../../routes/web';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import { enqueueSnackbar } from 'notistack';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';

const FavoriteItem = ({ data, loadData, searchModal }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useSmartNavigate();

    const handleOnDelete = async () => {
        try {
            await api.favorites.deleteOne({ productId: data.product.id });
            loadData(searchModal);
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
            sx={{
                m: 1,
                borderRadius: 'var(--brand-radius-lg)',
                boxShadow: 'var(--brand-shadow)',
                overflow: 'hidden'
            }}>
            <Box display={'flex'}>
                <CardActionArea
                    sx={{
                        display: 'flex',
                        alignItems: 'stretch',
                        flex: 1,
                        py: 1,
                        '&:hover': {
                            bgcolor: 'rgba(127, 127, 127, 0.06)'
                        }
                    }}
                    onClick={() =>
                        navigate(web.productDetail(data.product.id))
                    }>
                    <Box
                        display={'flex'}
                        gap={2}
                        alignItems={'center'}>
                        <Box
                            component={'img'}
                            src={`${
                                import.meta.env.VITE_API_BASE_URL
                            }/uploads/thumbs/${data.product.imageUrl}`}
                            alt={data.product.name}
                            loading={'lazy'}
                            sx={{
                                width: '25%',
                                height: 50,
                                objectFit: 'contain',
                                borderRadius: 'var(--brand-radius-sm)',
                                ml: 1
                            }}
                        />
                        <Box
                            display={'flex'}
                            flexDirection={'column'}
                            width={'100%'}>
                            <Typography
                                variant={'body2'}
                                color={'text.primary'}
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                <span
                                    style={{
                                        display: data.product.name
                                            ? 'inline'
                                            : 'none'
                                    }}>
                                    {data.product.name}
                                </span>
                            </Typography>
                            <Typography
                                variant={'caption'}
                                color={'text.secondary'}
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                <span
                                    style={{
                                        display: data.product.description
                                            ? 'inline'
                                            : 'none'
                                    }}>
                                    {data.product.description}
                                </span>
                            </Typography>
                            <Typography
                                fontSize={'0.75rem'}
                                color={'text.disabled'}
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                <span
                                    style={{
                                        display: data.createdAt
                                            ? 'inline'
                                            : 'none'
                                    }}>
                                    Time:{' '}
                                </span>
                                {new Date(data.createdAt).toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                </CardActionArea>
                <Box
                    textAlign={'right'}
                    sx={{ textAlign: '-webkit-right', p: 1 }}>
                    <IconButton
                        color={'error'}
                        onClick={handleOnDelete}>
                        <DeleteRounded fontSize={'small'} />
                    </IconButton>
                    <Typography
                        fontSize={14}
                        fontWeight={700}
                        noWrap
                        translate={'no'}>
                        {useStyledLocaleString(
                            data.product.price,
                            user?.geoInfo
                        )}
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
};

export default FavoriteItem;
