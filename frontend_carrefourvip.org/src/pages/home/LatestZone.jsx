import {
    Grid,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import ProductItem from '../product/ProductItem';

const LatestZone = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const payload = {
            page: 1,
            limit: 6,
            orderBy: 'desc',
            sortBy: 'id',
            isRandom: 0
        };

        const res = await api.products.getAll(payload);
        setProducts(res.data.data);
    };

    return (
        <Grid
            sx={{
                position: 'relative',
                overflow: 'hidden'
            }}>
            <Grid
                container
                direction={'column'}
                justifyContent={'center'}
                alignItems={'center'}
                sx={{
                    py: '1rem'
                }}>
                <Grid
                    container
                    direction={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    sx={{
                        width: '70%'
                    }}>
                    <Typography
                        fontSize={18}
                        textAlign={'center'}
                        color={'primary'}
                        sx={{
                            fontFamily: '"Alex Brush", cursive'
                        }}>
                        Latest Products
                    </Typography>
                    <Typography
                        variant={'h1'}
                        fontSize={14}
                        fontWeight={'bold'}
                        textAlign={'center'}
                        sx={{ color: '#211f28cc' }}>
                        The latest products are on the shelves, come and buy them.
                    </Typography>
                </Grid>
                <Grid
                    container
                    spacing={2}
                    sx={{ m: 2 }}>
                    {products.map((product) => (
                        <Grid
                            key={product.id}
                            size={{ xs: 6 }}
                            sx={{
                                transition: '0.6s ease'
                            }}>
                            <ProductItem
                                data={product}
                                doubleRow={true}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default LatestZone;
