import { VisibilityOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import ModalViewBooking from './ModalViewBooking';

const RowActions = ({ data }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Tooltip
                title='查看详情'
                arrow>
                <IconButton
                    size='small'
                    onClick={() => setOpen(true)}>
                    <VisibilityOutlined fontSize='inherit' />
                </IconButton>
            </Tooltip>

            <ModalViewBooking
                open={open}
                setOpen={setOpen}
                data={data}
            />
        </>
    );
};

export default RowActions;
