import { useState } from 'react';
import {
    Box,
    Button,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import { CheckRounded, PaletteRounded } from '@mui/icons-material';
import { themeModes } from '../theme/brandTheme';
import { useThemeMode } from '../context/ThemeModeContext';

const ThemeSwitcher = () => {
    const { mode, setMode } = useThemeMode();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClose = () => setAnchorEl(null);

    const handleSelect = (nextMode) => {
        setMode(nextMode);
        handleClose();
    };

    return (
        <>
            <Tooltip title={'Switch style'}>
                <IconButton
                    aria-label={'Switch style'}
                    onClick={(event) => setAnchorEl(event.currentTarget)}
                    sx={{
                        position: 'fixed',
                        right: { xs: 18, sm: 'calc((100vw - 600px) / 2 + 18px)' },
                        bottom: 154,
                        zIndex: 1300,
                        width: 48,
                        height: 48,
                        bgcolor: 'var(--brand-paper)',
                        border: '1px solid var(--brand-line)',
                        boxShadow: 'var(--brand-shadow)',
                        backdropFilter: 'blur(var(--brand-blur))',
                        '&:hover': {
                            bgcolor: 'var(--brand-paper)'
                        }
                    }}>
                    <PaletteRounded />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 310,
                        mt: 1,
                        p: 1,
                        borderRadius: 'var(--brand-radius-lg)',
                        bgcolor: 'var(--brand-paper)',
                        border: '1px solid var(--brand-line)',
                        boxShadow: 'var(--brand-shadow)',
                        backdropFilter: 'blur(var(--brand-blur))'
                    }
                }}>
                <Box sx={{ px: 1.5, py: 1 }}>
                    <Typography
                        sx={{
                            color: 'var(--brand-ink)',
                            fontSize: 15,
                            fontWeight: 800
                        }}>
                        Website Style
                    </Typography>
                    <Typography
                        sx={{
                            mt: 0.25,
                            color: 'var(--brand-muted)',
                            fontSize: 12
                        }}>
                        Same content, different visual identity.
                    </Typography>
                </Box>
                <Divider sx={{ borderColor: 'var(--brand-line)', my: 0.5 }} />
                {Object.entries(themeModes).map(([key, theme]) => {
                    const selected = key === mode;

                    return (
                        <MenuItem
                            key={key}
                            selected={selected}
                            onClick={() => handleSelect(key)}
                            sx={{
                                alignItems: 'center',
                                gap: 1.25,
                                my: 0.5,
                                borderRadius: 'var(--brand-radius-md)',
                                color: 'var(--brand-ink)',
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(127, 127, 127, 0.1)'
                                }
                            }}>
                            <Stack
                                direction={'row'}
                                spacing={0.5}
                                sx={{ width: 54 }}>
                                {theme.preview.map((color) => (
                                    <Box
                                        key={color}
                                        sx={{
                                            width: 15,
                                            height: 28,
                                            borderRadius: 'var(--brand-radius-pill)',
                                            bgcolor: color,
                                            border: '1px solid rgba(127, 127, 127, 0.18)'
                                        }}
                                    />
                                ))}
                            </Stack>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                    sx={{ fontSize: 14, fontWeight: 800 }}>
                                    {theme.label}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: 'var(--brand-muted)',
                                        fontSize: 12,
                                        whiteSpace: 'normal'
                                    }}>
                                    {theme.description}
                                </Typography>
                            </Box>
                            {selected ? (
                                <CheckRounded
                                    sx={{
                                        color: 'var(--brand-forest)',
                                        fontSize: 20
                                    }}
                                />
                            ) : null}
                        </MenuItem>
                    );
                })}
                <Box sx={{ px: 1, pt: 0.5 }}>
                    <Button
                        fullWidth
                        variant={'outlined'}
                        size={'small'}
                        onClick={() => handleSelect('classic')}>
                        Reset to Classic
                    </Button>
                </Box>
            </Menu>
        </>
    );
};

export default ThemeSwitcher;
