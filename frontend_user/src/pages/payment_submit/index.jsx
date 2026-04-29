import { Box, Typography, Button } from '@mui/material';
import web from '../../routes/web';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import { Trans, useTranslation } from 'react-i18next';

export default function PaymentSubmitPage() {
    const { t } = useTranslation();
    const navigate = useSmartNavigate();

    return (
        <Box
            textAlign={'center'}
            sx={{
                minHeight: '100vh',
                bgcolor: 'var(--brand-cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2
            }}>
            <Box
                sx={{
                    width: '100%',
                    p: 3,
                    borderRadius: '28px',
                    bgcolor: '#fffdfa',
                    border: '1px solid var(--brand-line)',
                    boxShadow: 'var(--brand-shadow)'
                }}>
            <AccessTimeIcon
                color={'action'}
                sx={{ fontSize: 80 }}
            />
            <Typography
                variant={'h4'}
                mt={2}>
                {t('paymentSubmit.title')}
            </Typography>
            <Typography
                variant={'body1'}
                mt={1}
                p={1}>
                <Trans
                    i18nKey={'paymentSubmit.description'}
                    components={{ br: <br />, strong: <strong /> }}
                />
            </Typography>
            <Button
                variant={'contained'}
                color={'primary'}
                sx={{ mt: 4 }}
                onClick={() => navigate(web.home)}>
                {t('common.backToHome')}
            </Button>
            </Box>
        </Box>
    );
}
