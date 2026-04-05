import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import ProductDeletePage from '../product_delete';

export default function ModalRecycle({ open, setOpen }) {
    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth={'lg'}>
            <DialogTitle>商品回收站</DialogTitle>
            <DialogContent dividers>
                <ProductDeletePage />
            </DialogContent>
            <DialogActions>
                <Button
                    sx={{ ml: 1 }}
                    onClick={() => setOpen(false)}
                    variant={'outlined'}
                    color={'action'}>
                    关闭
                </Button>
            </DialogActions>
        </Dialog>
    );
}
