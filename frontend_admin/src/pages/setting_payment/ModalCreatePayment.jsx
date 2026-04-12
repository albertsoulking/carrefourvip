import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import {
    CategoryRounded,
    ContentCopyRounded,
    VisibilityOffRounded,
    VisibilityRounded
} from '@mui/icons-material';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const TAB_KEYS = ['frontend', 'backend'];
const SECTION_KEYS = ['general', 'test', 'live'];
const CURRENCY_OPTIONS = ['USD', 'EUR', 'MMK'];

const normalizeScope = (value) =>
    value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const createEmptyConfig = () => ({
    frontend: {},
    backend: {}
});

const DEFAULT_TEMPLATES = {
    paypal: {
        frontend: {
            client_id_test: '',
            client_id_live: '',
            currency: 'EUR'
        },
        backend: {
            secret_key_test: '',
            secret_key_live: '',
            currency: 'EUR'
        }
    },
    stripe: {
        frontend: {
            pk_test: '',
            pk_live: ''
        },
        backend: {
            sk_test: '',
            sk_live: ''
        }
    },
    wise: {
        frontend: {
        },
        backend: {
        }
    },
    lemon: {
        frontend: {
            api_key_pk_test: '',
            api_key_pk_live: ''
        },
        backend: {
            api_key_sk_test: '',
            api_key_sk_live: ''
        }
    },
    pay2s: {
        frontend: {
            access_key_test: '',
            access_key_live: '',
            partner_code_test: '',
            bank_account_test: ''
        },
        backend: {
            secret_key_test: '',
            secret_key_live: '',
            partner_code_live: '',
            bank_account_live: ''
        }
    },
    behalf: {
        frontend: {
            payment_link: '',
            note: ''
        },
        backend: {
        }
    },
    card: {
        frontend: {
            accountName: '',
            accountNumber: '',
            bankName: '',
            swiftCode: '',
            bankAddress: '',
            note: ''
        },
        backend: {
        }
    },
    starpay: {
        frontend: {
            crypto_address: '',
            note: ''
        },
        backend: {
        }
    },
    faf: {
        frontend: {
            account_name: '',
            payment_link: '',
            note: ''
        },
        backend: {
        }
    },
    default: {
        frontend: {
        },
        backend: {
        }
    }
};

const getGatewayKey = ({ providerCode, providerName }) => {
    const source = `${providerCode || ''} ${providerName || ''}`.toLowerCase();

    if (source.includes('paypal') || source.includes('pyapal')) return 'paypal';
    if (source.includes('stripe')) return 'stripe';
    if (source.includes('wise')) return 'wise';
    if (source.includes('lemon')) return 'lemon';
    if (source.includes('pay2s')) return 'pay2s';
    if (source.includes('behalf')) return 'behalf';
    if (source.includes('card')) return 'card';
    if (source.includes('star')) return 'starpay';
    if (source.includes('friend') || source.includes('family') || source.includes('faf')) return 'faf';

    return 'default';
};

const getTemplateForGateway = (payload) => {
    const gatewayKey = getGatewayKey(payload);
    return {
        gatewayKey,
        template: DEFAULT_TEMPLATES[gatewayKey] || DEFAULT_TEMPLATES.default
    };
};

const getSectionKey = (key) => {
    if (key.endsWith('_test')) return 'test';
    if (key.endsWith('_live')) return 'live';
    return 'general';
};

const stripEnvironmentSuffix = (key) => key.replace(/_(test|live)$/i, '');

const formatFieldLabel = (key, sectionKey) => {
    const baseLabel = stripEnvironmentSuffix(key)
        .split('_')
        .filter(Boolean)
        .map((part) => {
            const upper = part.toUpperCase();
            if (['ID', 'API', 'URL', 'IBAN', 'SWIFT'].includes(upper)) {
                return upper;
            }
            return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join(' ');

    if (sectionKey === 'test') return `${baseLabel} (Test)`;
    if (sectionKey === 'live') return `${baseLabel} (Live)`;
    return baseLabel;
};

const detectFieldType = (key) => {
    const normalized = key.toLowerCase();

    if (normalized.includes('currency')) return 'currency';
    if (normalized.includes('secret') || normalized.includes('key')) return 'password';
    return 'text';
};

const groupConfigFields = (scopeConfig) => {
    const grouped = {
        general: [],
        test: [],
        live: []
    };

    Object.entries(normalizeScope(scopeConfig)).forEach(([key, value]) => {
        const sectionKey = getSectionKey(key);
        grouped[sectionKey].push({
            key,
            label: formatFieldLabel(key, sectionKey),
            type: detectFieldType(key),
            value: value ?? ''
        });
    });

    return grouped;
};

const validateCreateForm = (formData, formConfig, t) => {
    const nextErrors = {};

    if (!formData.providerId) {
        nextErrors.providerId = t('settingPayment.form.providerRequired');
    }

    TAB_KEYS.forEach((scope) => {
        Object.entries(normalizeScope(formConfig?.[scope])).forEach(([key, value]) => {
            if (String(value ?? '').trim() === '') {
                nextErrors[`config.${scope}.${key}`] = t(
                    'settingPayment.form.requiredField'
                );
            }
        });
    });

    return nextErrors;
};

const ConfigSection = ({
    sectionKey,
    fields,
    scope,
    visiblePasswords,
    errors,
    onTogglePassword,
    onCopy,
    onChange,
    t
}) => {
    if (fields.length === 0) return null;

    const sectionMeta = {
        general: {
            title: t('settingPayment.config.general.title'),
            description: t('settingPayment.config.general.description')
        },
        test: {
            title: t('settingPayment.config.test.title'),
            description: t('settingPayment.config.test.description')
        },
        live: {
            title: t('settingPayment.config.live.title'),
            description: t('settingPayment.config.live.description')
        }
    };

    return (
        <Box>
            <Typography
                variant={'subtitle1'}
                sx={{ fontWeight: 700, mb: 0.5 }}>
                {sectionMeta[sectionKey].title}
            </Typography>
            <Typography
                variant={'body2'}
                color={'text.secondary'}
                sx={{ mb: 2 }}>
                {sectionMeta[sectionKey].description}
            </Typography>
            <Stack spacing={2}>
                {fields.map((field) => {
                    const fieldId = `config.${scope}.${field.key}`;
                    const error = errors[fieldId];
                    const visible = Boolean(visiblePasswords[fieldId]);

                    if (field.type === 'currency') {
                        return (
                            <FormControl
                                key={fieldId}
                                fullWidth
                                error={Boolean(error)}>
                                <InputLabel>{field.label}</InputLabel>
                                <Select
                                    value={field.value}
                                    label={field.label}
                                    onChange={(event) =>
                                        onChange(scope, field.key, event.target.value)
                                    }>
                                    {CURRENCY_OPTIONS.map((option) => (
                                        <MenuItem
                                            key={option}
                                            value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>
                                    {error ||
                                        t(
                                            'settingPayment.form.selectSettlementCurrency'
                                        )}
                                </FormHelperText>
                            </FormControl>
                        );
                    }

                    return (
                        <TextField
                            key={fieldId}
                            fullWidth
                            required
                            label={field.label}
                            type={field.type === 'password' && !visible ? 'password' : 'text'}
                            value={field.value}
                            error={Boolean(error)}
                            helperText={error || ' '}
                            onChange={(event) =>
                                onChange(scope, field.key, event.target.value)
                            }
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position={'end'}>
                                        {field.type === 'password' && (
                                            <Tooltip
                                                title={t(
                                                    'settingPayment.actions.showOrHide'
                                                )}>
                                                <IconButton
                                                    edge={'end'}
                                                    onClick={() => onTogglePassword(fieldId)}>
                                                    {visible ? (
                                                        <VisibilityOffRounded />
                                                    ) : (
                                                        <VisibilityRounded />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip
                                            title={t(
                                                'settingPayment.actions.copyValue'
                                            )}>
                                            <IconButton
                                                edge={'end'}
                                                onClick={() => onCopy(field.value, field.label)}>
                                                <ContentCopyRounded />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                )
                            }}
                        />
                    );
                })}
            </Stack>
        </Box>
    );
};

export default function ModalCreate({
    open,
    setOpen,
    loadData,
    searchModal
}) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        providerId: ''
    });
    const [providers, setProviders] = useState([]);
    const [activeTab, setActiveTab] = useState('frontend');
    const [formConfig, setFormConfig] = useState(createEmptyConfig());
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadProvider();
    }, []);

    useEffect(() => {
        if (!open) return;

        const selectedProvider = providers.find(
            (provider) => provider.id === Number(formData.providerId)
        );
        const { template } = getTemplateForGateway({
            providerCode: selectedProvider?.code,
            providerName: selectedProvider?.name
        });

        setFormConfig((prev) => {
            const currentIsEmpty =
                Object.keys(normalizeScope(prev.frontend)).length === 0 &&
                Object.keys(normalizeScope(prev.backend)).length === 0;

            return currentIsEmpty ? template : prev;
        });
    }, [open, providers]);

    const selectedProvider = useMemo(
        () => providers.find((provider) => provider.id === Number(formData.providerId)),
        [providers, formData.providerId]
    );

    const groupedFields = useMemo(
        () => ({
            frontend: groupConfigFields(formConfig.frontend),
            backend: groupConfigFields(formConfig.backend)
        }),
        [formConfig]
    );

    const loadProvider = async () => {
        const res = await api.provider.getAll();
        setProviders(res.data);
    };

    const handleOnClose = () => {
        setOpen(false);
        setFormData({
            providerId: ''
        });
        setFormConfig(createEmptyConfig());
        setVisiblePasswords({});
        setErrors({});
        setActiveTab('frontend');
    };

    const applyTemplateBySelection = (nextFormData) => {
        const provider = providers.find(
            (item) => item.id === Number(nextFormData.providerId)
        );
        const { template } = getTemplateForGateway({
            providerCode: provider?.code,
            providerName: provider?.name
        });

        setFormConfig(template);
    };

    const handleOnChange = (name, value) => {
        const nextFormData = {
            ...formData,
            [name]: value ?? ''
        };

        setFormData(nextFormData);
        setErrors((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
        });

        if (name === 'providerId') {
            applyTemplateBySelection(nextFormData);
        }
    };

    const handleConfigChange = (scope, key, value) => {
        setFormConfig((prev) => ({
            ...prev,
            [scope]: {
                ...prev[scope],
                [key]: value
            }
        }));

        setErrors((prev) => {
            const next = { ...prev };
            delete next[`config.${scope}.${key}`];
            return next;
        });
    };

    const handleTogglePassword = (fieldId) => {
        setVisiblePasswords((prev) => ({
            ...prev,
            [fieldId]: !prev[fieldId]
        }));
    };

    const handleCopy = async (value, label) => {
        try {
            await navigator.clipboard.writeText(String(value ?? ''));
            enqueueSnackbar(t('settingPayment.snackbar.copied', { label }), {
                variant: 'success'
            });
        } catch (error) {
            enqueueSnackbar(t('settingPayment.snackbar.copyFailed'), {
                variant: 'error'
            });
        }
    };

    const handleCreateSubmit = async () => {
        const nextErrors = validateCreateForm(formData, formConfig, t);
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            enqueueSnackbar(t('settingPayment.snackbar.completeRequiredFields'), {
                variant: 'error'
            });
            return;
        }

        try {
            setSubmitting(true);
            await api.gateway.create({
                name: selectedProvider?.name,
                providerId: Number(formData.providerId),
                config: JSON.stringify(formConfig, null, 2)
            });
            loadData(searchModal);
            handleOnClose();
            enqueueSnackbar(t('settingPayment.snackbar.created'), {
                variant: 'success'
            });
        } catch (error) {
            enqueueSnackbar(
                Array.isArray(error.response?.data?.message)
                    ? error.response.data.message[0]
                    : error.response?.data?.message || error.message,
                {
                    variant: 'error'
                }
            );
        } finally {
            setSubmitting(false);
        }
    };

    const activeFields = groupedFields[activeTab];
    const hasConfigFields = SECTION_KEYS.some(
        (sectionKey) => activeFields[sectionKey].length > 0
    );

    return (
        <Dialog
            open={open}
            onClose={handleOnClose}
            maxWidth={'md'}
            fullWidth
            container={document.body}
            disablePortal={false}>
            <DialogTitle
                sx={{
                    pb: 1,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiSvgIcon-root': { mr: 1 }
                }}>
                <CategoryRounded color={'primary'} />{' '}
                {t('settingPayment.modalCreate.title')}
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5}>
                    <FormControl
                        fullWidth
                        required
                        error={Boolean(errors.providerId)}>
                        <InputLabel>{t('settingPayment.fields.provider')}</InputLabel>
                        <Select
                            value={formData.providerId}
                            label={t('settingPayment.fields.provider')}
                            onChange={(event) =>
                                handleOnChange('providerId', event.target.value)
                            }>
                            {providers.map((provider) => (
                                <MenuItem
                                    key={provider.id}
                                    value={provider.id}>
                                    {provider.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                            {errors.providerId ||
                                t('settingPayment.form.providerHelp')}
                        </FormHelperText>
                    </FormControl>

                    {selectedProvider && (
                        <Alert severity={'info'}>
                            {t('settingPayment.modalCreate.currentTemplate')}{' '}
                            {selectedProvider.name}
                            {' '}
                            (
                            {selectedProvider.code}
                            )
                        </Alert>
                    )}

                    <Divider />

                    <Tabs
                        value={activeTab}
                        onChange={(event, value) => setActiveTab(value)}>
                        <Tab
                            value={'frontend'}
                            label={t('settingPayment.tabs.frontend')}
                        />
                        <Tab
                            value={'backend'}
                            label={t('settingPayment.tabs.backend')}
                        />
                    </Tabs>

                    {!hasConfigFields ? (
                        <Alert severity={'warning'}>
                            {t('settingPayment.modalCreate.emptyConfig')}
                        </Alert>
                    ) : (
                        <Stack spacing={3}>
                            {SECTION_KEYS.map((sectionKey, index) => {
                                const fields = activeFields[sectionKey];

                                if (fields.length === 0) {
                                    return null;
                                }

                                return (
                                    <Box key={`${activeTab}-${sectionKey}`}>
                                        {index !== 0 && <Divider sx={{ mb: 3 }} />}
                                        <ConfigSection
                                            sectionKey={sectionKey}
                                            fields={fields}
                                            scope={activeTab}
                                            visiblePasswords={visiblePasswords}
                                            errors={errors}
                                            onTogglePassword={handleTogglePassword}
                                            onCopy={handleCopy}
                                            onChange={handleConfigChange}
                                            t={t}
                                        />
                                    </Box>
                                );
                            })}
                        </Stack>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={handleOnClose}
                    variant={'outlined'}
                    color={'error'}
                    sx={{ width: 100 }}>
                    {t('common.cancel')}
                </Button>
                <Button
                    onClick={handleCreateSubmit}
                    variant={'contained'}
                    color={'primary'}
                    disabled={submitting}
                    sx={{ width: 100 }}>
                    {submitting
                        ? t('settingPayment.modalCreate.creating')
                        : t('common.create')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
