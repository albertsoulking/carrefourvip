import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Switch,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const ModalAccountSettings = ({
    open,
    data,
    setOpen,
    setOpenChangePassword,
    setOpenVerifyPassword
}) => {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            maxWidth={'sm'}
            fullWidth>
            <DialogTitle>{t('acc.accSetting')}</DialogTitle>
            <DialogContent dividers>
                <Typography
                    fontSize={14}
                    fontWeight={'bold'}
                    mb={2}>
                    {t('acc.accInfo')}
                </Typography>
                <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    mb={2}>
                    <Typography>{t('acc.adminAcc')}</Typography>
                    <Typography color={'primary'}>{data?.email}</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography
                    fontSize={14}
                    fontWeight={'bold'}
                    mb={2}>
                    {t('acc.securitySetting')}
                </Typography>
                <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    mb={1}>
                    <Typography>
                        {t('acc.2faGoogle')}
                        <br />
                        <span style={{ fontSize: 12, color: 'gray' }}>
                            {t('acc.2faGoogleDesc')}
                        </span>
                    </Typography>
                    <Switch
                        size={'small'}
                        value={data?.twoFactorEnabled}
                        checked={data?.twoFactorEnabled === 1}
                        onChange={(e) => {
                            setOpenVerifyPassword({
                                open: true,
                                data: {
                                    ...data,
                                    twoFactorEnabled: e.target.checked ? 1 : 0
                                }
                            });
                            setOpen({ open: false, data });
                        }}
                    />
                </Box>
                <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    mb={1}>
                    <Typography>
                        {t('acc.pass')}
                        <br />
                        <span style={{ fontSize: 12, color: 'gray' }}>
                            {t('acc.passDesc')}
                        </span>
                    </Typography>
                    <Button
                        variant={'outlined'}
                        size={'small'}
                        sx={{ fontSize: 12, textTransform: 'capitalize' }}
                        onClick={() => {
                            setOpenChangePassword({ open: true, data });
                            setOpen({ open: false, data });
                        }}>
                        {t('acc.setPass')}
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    variant={'outlined'}
                    color={'default'}
                    size={'small'}
                    sx={{ width: 100, textTransform: 'capitalize' }}
                    onClick={() => setOpen({ open: false, data })}>
                    {t('acc.cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalAccountSettings;
