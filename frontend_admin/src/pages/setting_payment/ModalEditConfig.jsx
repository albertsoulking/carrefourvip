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
    ContentCopyRounded,
    RefreshRounded,
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

const parseConfigValue = (value) => {
    if (!value) {
        return {
            parsed: createEmptyConfig(),
            raw: JSON.stringify(createEmptyConfig(), null, 2),
            error: ''
        };
    }

    if (typeof value === 'object') {
        const normalized = {
            frontend: normalizeScope(value.frontend),
            backend: normalizeScope(value.backend)
        };

        return {
            parsed: normalized,
            raw: JSON.stringify(normalized, null, 2),
            error: ''
        };
    }

    try {
        const parsed = JSON.parse(value);
        const normalized = {
            frontend: normalizeScope(parsed.frontend),
            backend: normalizeScope(parsed.backend)
        };

        return {
            parsed: normalized,
            raw: JSON.stringify(normalized, null, 2),
            error: ''
        };
    } catch (error) {
        return {
            parsed: null,
            raw: String(value),
            error: error.message || 'Invalid JSON'
        };
    }
};

const getGatewayOverrides = (gatewayName = '') => {
    const normalized = gatewayName.toLowerCase();

    return {
        resolveType: (key, defaultType) => {
            if (
                normalized.includes('paypal') &&
                key.toLowerCase().includes('client_id')
            ) {
                return 'text';
            }

            if (
                normalized.includes('stripe') &&
                key.toLowerCase().includes('publishable')
            ) {
                return 'text';
            }

            return defaultType;
        }
    };
};

const getSectionKey = (key) => {
    if (key.endsWith('_test')) return 'test';
    if (key.endsWith('_live')) return 'live';
    return 'general';
};

const stripEnvironmentSuffix = (key) =>
    key.replace(/_(test|live)$/i, '');

const formatFieldLabel = (key, sectionKey) => {
    const cleanKey = stripEnvironmentSuffix(key);
    const baseLabel = cleanKey
        .split('_')
        .filter(Boolean)
        .map((part) => {
            const upper = part.toUpperCase();

            if (['ID', 'API', 'URL', 'IP'].includes(upper)) {
                return upper;
            }

            return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join(' ');

    if (sectionKey === 'test') return `${baseLabel} (Test)`;
    if (sectionKey === 'live') return `${baseLabel} (Live)`;
    return baseLabel;
};

const detectFieldType = (key, overrides) => {
    const normalizedKey = key.toLowerCase();
    let fieldType = 'text';

    if (normalizedKey.includes('currency')) {
        fieldType = 'currency';
    } else if (
        normalizedKey.includes('secret') ||
        normalizedKey.includes('key')
    ) {
        fieldType = 'password';
    } else if (
        normalizedKey.includes('account') ||
        normalizedKey.includes('number')
    ) {
        fieldType = 'text';
    }

    return overrides.resolveType(key, fieldType);
};

const groupConfigFields = (scopeConfig, gatewayName) => {
    const overrides = getGatewayOverrides(gatewayName);
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
            sectionKey,
            type: detectFieldType(key, overrides),
            value: value ?? ''
        });
    });

    return grouped;
};

const validateConfig = (config, t) => {
    const errors = {};

    TAB_KEYS.forEach((scope) => {
        Object.entries(normalizeScope(config?.[scope])).forEach(([key, value]) => {
            if (String(value ?? '').trim() === '') {
                errors[`${scope}.${key}`] = t(
                    'settingPayment.form.requiredField'
                );
            }
        });
    });

    return errors;
};

const ConfigSection = ({
    sectionKey,
    fields,
    scope,
    errors,
    visiblePasswords,
    onTogglePassword,
    onCopy,
    onChange,
    t
}) => {
    if (fields.length === 0) {
        return null;
    }

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
                    const fieldId = `${scope}.${field.key}`;
                    const isPasswordVisible = Boolean(visiblePasswords[fieldId]);
                    const error = errors[fieldId];

                    if (field.type === 'currency') {
                        return (
                            <FormControl
                                key={fieldId}
                                fullWidth
                                error={Boolean(error)}>
                                <InputLabel>{field.label}</InputLabel>
                                <Select
                                    label={field.label}
                                    value={field.value}
                                    onChange={(event) =>
                                        onChange(
                                            scope,
                                            field.key,
                                            event.target.value
                                        )
                                    }>
                                    {CURRENCY_OPTIONS.map((currency) => (
                                        <MenuItem
                                            key={currency}
                                            value={currency}>
                                            {currency}
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
                            type={
                                field.type === 'password' && !isPasswordVisible
                                    ? 'password'
                                    : 'text'
                            }
                            value={field.value}
                            error={Boolean(error)}
                            helperText={
                                error ||
                                (field.type === 'password'
                                    ? t(
                                          'settingPayment.form.sensitiveValueHelp'
                                      )
                                    : ' ')
                            }
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
                                                    onClick={() =>
                                                        onTogglePassword(fieldId)
                                                    }>
                                                    {isPasswordVisible ? (
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
                                                onClick={() =>
                                                    onCopy(field.value, field.label)
                                                }>
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

export default function ModalEditConfig({
    open,
    data,
    setOpen,
    id,
    gatewayName,
    onSave
}) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('frontend');
    const [rawJson, setRawJson] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [defaultConfig, setDefaultConfig] = useState(createEmptyConfig());
    const [formConfig, setFormConfig] = useState(createEmptyConfig());
    const [errors, setErrors] = useState({});
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;

        const { parsed, raw, error } = parseConfigValue(data);

        setRawJson(raw);
        setJsonError(error);
        setVisiblePasswords({});
        setErrors({});
        setActiveTab('frontend');

        if (parsed) {
            setDefaultConfig(parsed);
            setFormConfig(parsed);
        } else {
            const emptyConfig = createEmptyConfig();
            setDefaultConfig(emptyConfig);
            setFormConfig(emptyConfig);
        }
    }, [open, data]);

    const groupedFields = useMemo(
        () => ({
            frontend: groupConfigFields(formConfig.frontend, gatewayName),
            backend: groupConfigFields(formConfig.backend, gatewayName)
        }),
        [formConfig, gatewayName]
    );

    const handleClose = () => {
        setOpen(false);
    };

    const handleFieldChange = (scope, key, value) => {
        setFormConfig((prev) => ({
            ...prev,
            [scope]: {
                ...prev[scope],
                [key]: value
            }
        }));

        setErrors((prev) => {
            const next = { ...prev };
            delete next[`${scope}.${key}`];
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

    const handleReset = () => {
        setFormConfig(defaultConfig);
        setErrors({});
        setVisiblePasswords({});
        setJsonError('');
    };

    const handleSave = async () => {
        if (jsonError) {
            enqueueSnackbar(t('settingPayment.modalEdit.invalidJson'), {
                variant: 'error'
            });
            return;
        }

        const nextErrors = validateConfig(formConfig, t);
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            enqueueSnackbar(t('settingPayment.snackbar.completeRequiredFields'), {
                variant: 'error'
            });
            return;
        }

        const formatted = JSON.stringify(formConfig, null, 2);

        try {
            setSaving(true);

            if (typeof onSave === 'function') {
                await onSave(formatted);
            } else {
                await api.gateway.update({
                    id,
                    config: formatted
                });
            }

            enqueueSnackbar(t('settingPayment.snackbar.updated'), {
                variant: 'success'
            });
            setOpen(false);
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
            setSaving(false);
        }
    };

    const activeFields = groupedFields[activeTab];
    const hasAnyFields = SECTION_KEYS.some(
        (sectionKey) => activeFields[sectionKey].length > 0
    );

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth={'md'}>
            <DialogTitle>
                {gatewayName
                    ? t('settingPayment.modalEdit.titleWithName', {
                          name: gatewayName
                      })
                    : t('settingPayment.modalEdit.title')}
            </DialogTitle>
            <DialogContent dividers>
                {jsonError && (
                    <Alert
                        severity={'warning'}
                        sx={{ mb: 2 }}>
                        {t('settingPayment.modalEdit.invalidJsonWarning')}
                        <Box sx={{ mt: 1 }}>
                            <Typography
                                variant={'body2'}
                                component={'pre'}
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    mb: 0,
                                    fontFamily: 'monospace'
                                }}>
                                {rawJson}
                            </Typography>
                        </Box>
                    </Alert>
                )}

                <Tabs
                    value={activeTab}
                    onChange={(event, value) => setActiveTab(value)}
                    sx={{ mb: 3 }}>
                    <Tab
                        value={'frontend'}
                        label={t('settingPayment.tabs.frontend')}
                    />
                    <Tab
                        value={'backend'}
                        label={t('settingPayment.tabs.backend')}
                    />
                </Tabs>

                {!hasAnyFields ? (
                    <Alert severity={'info'}>
                        {t('settingPayment.modalEdit.noConfigFields')}
                    </Alert>
                ) : (
                    <Stack spacing={3}>
                        {SECTION_KEYS.map((sectionKey, index) => {
                            const fields = activeFields[sectionKey];

                            if (fields.length === 0) {
                                return null;
                            }

                            return (
                                <Box key={sectionKey}>
                                    {index !== 0 && <Divider sx={{ mb: 3 }} />}
                                    <ConfigSection
                                        sectionKey={sectionKey}
                                        fields={fields}
                                        scope={activeTab}
                                        errors={errors}
                                        visiblePasswords={visiblePasswords}
                                        onTogglePassword={handleTogglePassword}
                                        onCopy={handleCopy}
                                        onChange={handleFieldChange}
                                        t={t}
                                    />
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    startIcon={<RefreshRounded />}
                    onClick={handleReset}
                    variant={'outlined'}>
                    {t('settingPayment.modalEdit.resetToDefault')}
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    onClick={handleClose}
                    variant={'outlined'}>
                    {t('common.close')}
                </Button>
                <Button
                    onClick={handleSave}
                    variant={'contained'}
                    disabled={saving}>
                    {saving ? t('common.saving') : t('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
