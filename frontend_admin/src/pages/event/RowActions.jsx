import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ModalUpdate from './ModalUpdate';
import { useState } from 'react';

const RowActions = ({
    data
}) => {
    const { t } = useTranslation();
    const [openUpdate, setOpenUpdate] = useState(false);

    return (
        <Box>
            <Button
                color={'error'}
                size={'small'}
                sx={{ fontSize: 12, p: 0, textTransform: 'capitalize' }}
                onClick={() => setOpenUpdate(true)}>
                {t('table.edit')}
            </Button>
             <ModalUpdate
                open={openUpdate}
                data={data}
                setOpen={setOpenUpdate}
            />
        </Box>
    );
};

export default RowActions;
