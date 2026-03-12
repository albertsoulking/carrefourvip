import {
    Box,
    Card,
    Checkbox,
    FormControlLabel,
    FormGroup
} from '@mui/material';
import CartItem from './CartItem';

const CartHasItem = ({
    data,
    setOpen,
    selectedIds,
    setSelectedIds,
    loadCartData
}) => {
    const isAllSelected = selectedIds.length === data.length;
    const isIndeterminate = selectedIds.length > 0 && !isAllSelected;

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedIds(data.map((item) => item.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((itemId) => itemId !== id)
                : [...prev, id]
        );
    };

    return (
        <Card
            elevation={0}
            sx={{ borderRadius: 5, maxWidth: 360, height: '100%', p: 1 }}>
            <FormGroup>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isAllSelected}
                            indeterminate={isIndeterminate}
                            onChange={handleSelectAll}
                        />
                    }
                    label={<span>Select All {selectedIds.length} Orders</span>}
                />
                {data.map((item) => (
                    <Box
                        key={item.id}
                        display={'flex'}
                        alignItems={'center'}
                        width={'100%'}>
                        <Checkbox
                            checked={selectedIds.includes(item.id)}
                            onChange={() => handleSelectOne(item.id)}
                        />
                        <Box flex={1}>
                            <CartItem
                                data={item}
                                setOpen={setOpen}
                                loadCartData={loadCartData}
                            />
                        </Box>
                    </Box>
                ))}
            </FormGroup>
        </Card>
    );
};

export default CartHasItem;
