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

const TAB_KEYS = ['frontend', 'backend'];
const SECTION_KEYS = ['general', 'test', 'live'];
const CURRENCY_OPTIONS = ['USD', 'EUR', 'MMK'];

const SECTION_META = {
    general: {
        title: 'General Config',
        description: 'Shared values for both environments.'
    },
    test: {
        title: 'Test Config',
        description: 'Sandbox credentials and test-only values.'
    },
    live: {
        title: 'Live Config',
        description: 'Production credentials and live-only values.'
    }
};

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
            client_id_test: '',
            client_id_live: '',
            secret_key_test: '',
            secret_key_live: '',
            currency: 'EUR'
        }
    },
    stripe: {
        frontend: {
            publishable_key_test: '',
            publishable_key_live: '',
            currency: 'EUR'
        },
        backend: {
            secret_key_test: '',
            secret_key_live: '',
            webhook_secret_test: '',
            webhook_secret_live: '',
            currency: 'EUR'
        }
    },
    wise: {
        frontend: {
            account_name: '',
            currency: 'EUR'
        },
        backend: {
            account_number_live: '',
            iban_live: '',
            swift_live: '',
            currency: 'EUR'
        }
    },
    lemon: {
        frontend: {
            store_id_test: '',
            store_id_live: '',
            currency: 'EUR'
        },
        backend: {
            api_key_test: '',
            api_key_live: '',
            variant_id_test: '',
            variant_id_live: '',
            currency: 'EUR'
        }
    },
    pay2s: {
        frontend: {
            merchant_code_test: '',
            merchant_code_live: '',
            currency: 'EUR'
        },
        backend: {
            api_key_test: '',
            api_key_live: '',
            secret_key_test: '',
            secret_key_live: '',
            currency: 'EUR'
        }
    },
    behalf: {
        frontend: {
            account_name: '',
            currency: 'EUR'
        },
        backend: {
            account_number_live: '',
            reference_live: '',
            currency: 'EUR'
        }
    },
    card: {
        frontend: {
            account_name: '',
            card_number_live: '',
            currency: 'EUR'
        },
        backend: {
            bank_name_live: '',
            card_number_live: '',
            currency: 'EUR'
        }
    },
    starpay: {
        frontend: {
            wallet_address_live: '',
            currency: 'MMK'
        },
        backend: {
            api_key_live: '',
            secret_key_live: '',
            wallet_address_live: '',
            currency: 'MMK'
        }
    },
    faf: {
        frontend: {
            account_name: '',
            currency: 'EUR'
        },
        backend: {
            paypal_email_live: '',
            note_live: '',
            currency: 'EUR'
        }
    },
    default: {
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

const validateCreateForm = (formData, formConfig) => {
    const nextErrors = {};

    if (!formData.providerId) {
        nextErrors.providerId = '请选择供应商';
    }

    TAB_KEYS.forEach((scope) => {
        Object.entries(normalizeScope(formConfig?.[scope])).forEach(([key, value]) => {
            if (String(value ?? '').trim() === '') {
                nextErrors[`config.${scope}.${key}`] = 'This field is required.';
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
    onChange
}) => {
    if (fields.length === 0) return null;

    return (
        <Box>
            <Typography
                variant={'subtitle1'}
                sx={{ fontWeight: 700, mb: 0.5 }}>
                {SECTION_META[sectionKey].title}
            </Typography>
            <Typography
                variant={'body2'}
                color={'text.secondary'}
                sx={{ mb: 2 }}>
                {SECTION_META[sectionKey].description}
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
                                    {error || 'Select the settlement currency.'}
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
                                            <Tooltip title={'Show / hide'}>
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
                                        <Tooltip title={'Copy value'}>
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
            enqueueSnackbar(`${label} copied.`, {
                variant: 'success'
            });
        } catch (error) {
            enqueueSnackbar('复制失败', {
                variant: 'error'
            });
        }
    };

    const handleCreateSubmit = async () => {
        const nextErrors = validateCreateForm(formData, formConfig);
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            enqueueSnackbar('请先补全必填项', {
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
            enqueueSnackbar('创建成功!', {
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
                <CategoryRounded color={'primary'} /> 添加新支付
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5}>
                    <FormControl
                        fullWidth
                        required
                        error={Boolean(errors.providerId)}>
                        <InputLabel>供应商</InputLabel>
                        <Select
                            value={formData.providerId}
                            label={'供应商'}
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
                            {errors.providerId || '选择后会自动使用供应商名称创建支付通道'}
                        </FormHelperText>
                    </FormControl>

                    {selectedProvider && (
                        <Alert severity={'info'}>
                            当前配置模板:
                            {' '}
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
                            label={'Frontend'}
                        />
                        <Tab
                            value={'backend'}
                            label={'Backend'}
                        />
                    </Tabs>

                    {!hasConfigFields ? (
                        <Alert severity={'warning'}>
                            请先输入支付名称或选择供应商，系统会显示对应配置 UI。
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
                    取消
                </Button>
                <Button
                    onClick={handleCreateSubmit}
                    variant={'contained'}
                    color={'primary'}
                    disabled={submitting}
                    sx={{ width: 100 }}>
                    {submitting ? '创建中' : '创建'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
