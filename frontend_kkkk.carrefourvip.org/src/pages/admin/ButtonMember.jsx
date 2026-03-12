import { useState } from 'react';
import ModalViewMember from './ModalViewMember';
import { Button } from '@mui/material';

export default function ButtonMember({ value, data, roleName }) {
    const [openMember, setOpenMember] = useState(false);

    return (
        <>
            <Button
                variant={'outlined'}
                size={'small'}
                sx={{ p: 0 }}
                onClick={() => setOpenMember(true)}>
                {value || 0}
            </Button>
            <ModalViewMember
                open={openMember}
                data={{ ...data, roleName }}
                setOpen={setOpenMember}
            />
        </>
    );
}
