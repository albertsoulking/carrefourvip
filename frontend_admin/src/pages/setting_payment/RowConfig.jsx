import { Box, Button } from '@mui/material';
import ModalEditConfig from './ModalEditConfig';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const RowConfig = ({ data, permissions, id, gatewayName }) => {
    const { t } = useTranslation();
    const [openConfig, setOpenConfig] = useState(false);

    return (
        <Box>
            <Button
                size={'small'}
                sx={{ fontSize: 12, p: 0 }}
                onClick={() => setOpenConfig(true)}>
                {t('table.view')}
            </Button>
            <ModalEditConfig
                open={openConfig}
                setOpen={setOpenConfig}
                data={data}
                id={id}
                gatewayName={gatewayName}
            />
        </Box>
    );
};

export default RowConfig;
