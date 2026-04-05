import { useState } from 'react';
import ModalRecycle from './ModalRecycle';
import { useTranslation } from '../../../node_modules/react-i18next';
import { DeleteRounded } from '@mui/icons-material';
import { Button } from '@mui/material';

export default function ButtonRecycle() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                color={'error'}
                variant={'outlined'}
                onClick={() => setOpen(true)}
                startIcon={<DeleteRounded fontSize={'inherit'} />}
                size={'small'}
                sx={{
                    mr: 2,
                    fontSize: 12,
                    textTransform: 'capitalize'
                }}>
                {t('actionBar.recycle')}
            </Button>
            <ModalRecycle
                open={open}
                setOpen={setOpen}
            />
        </>
    );
}
