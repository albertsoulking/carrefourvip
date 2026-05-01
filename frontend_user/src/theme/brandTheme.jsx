import { createTheme } from '@mui/material/styles';

export const THEME_STORAGE_KEY = 'themeMode';

export const themeModes = {
    glass: {
        label: 'Apple Glass',
        description: 'Translucent, minimal, elegant',
        preview: ['#007aff', '#f7fbff', 'rgba(255,255,255,0.58)'],
        vars: {
            forest: '#007aff',
            ink: '#172033',
            muted: '#667085',
            cream: '#f7fbff',
            paper: 'rgba(255, 255, 255, 0.72)',
            line: 'rgba(23, 32, 51, 0.1)',
            shadow: '0 18px 48px rgba(22, 42, 80, 0.14)',
            nav: 'rgba(247, 251, 255, 0.78)',
            bodyBg:
                'radial-gradient(circle at top left, rgba(0, 122, 255, 0.14), transparent 30%), linear-gradient(180deg, #f7fbff 0%, #eaf3ff 100%)',
            hero:
                'linear-gradient(135deg, rgba(0, 122, 255, 0.92), rgba(93, 159, 255, 0.68))'
        },
        radius: 24,
        blur: '22px',
        primary: '#007aff',
        secondary: '#70a7ff',
        mode: 'light'
    },
    luxury: {
        label: 'Luxury Dark',
        description: 'Black, gold, premium',
        preview: ['#d4af37', '#0b0b0b', '#151515'],
        vars: {
            forest: '#d4af37',
            ink: '#f6edd0',
            muted: '#b8a878',
            cream: '#0b0b0b',
            paper: '#151515',
            line: 'rgba(212, 175, 55, 0.22)',
            shadow: '0 20px 56px rgba(0, 0, 0, 0.56)',
            nav: 'rgba(11, 11, 11, 0.86)',
            bodyBg:
                'radial-gradient(circle at top, rgba(212, 175, 55, 0.12), transparent 28%), linear-gradient(180deg, #080808 0%, #12100a 100%)',
            hero:
                'linear-gradient(135deg, rgba(9, 9, 9, 0.98), rgba(62, 48, 13, 0.9))'
        },
        radius: 16,
        blur: '16px',
        primary: '#d4af37',
        secondary: '#8d7330',
        mode: 'dark'
    },
    travel: {
        label: 'Travel Air',
        description: 'Bright, spacious, sky-inspired',
        preview: ['#00aeef', '#f5fbff', '#ffffff'],
        vars: {
            forest: '#00aeef',
            ink: '#16324f',
            muted: '#5f7894',
            cream: '#f5fbff',
            paper: '#ffffff',
            line: 'rgba(0, 174, 239, 0.14)',
            shadow: '0 16px 40px rgba(0, 174, 239, 0.14)',
            nav: 'rgba(245, 251, 255, 0.88)',
            bodyBg:
                'radial-gradient(circle at top right, rgba(0, 174, 239, 0.18), transparent 32%), linear-gradient(180deg, #f5fbff 0%, #eaf8ff 100%)',
            hero:
                'linear-gradient(135deg, rgba(0, 174, 239, 0.94), rgba(109, 210, 255, 0.78))'
        },
        radius: 20,
        blur: '14px',
        primary: '#00aeef',
        secondary: '#79d7ff',
        mode: 'light'
    },
    modern: {
        label: 'Modern Commerce',
        description: 'Clean, bold, conversion-focused',
        preview: ['#17392c', '#f7f2e8', '#fffdfa'],
        vars: {
            forest: '#17392c',
            ink: '#182018',
            muted: '#687166',
            cream: '#f7f2e8',
            paper: '#fffdfa',
            line: 'rgba(23, 57, 44, 0.08)',
            shadow: '0 14px 32px rgba(23, 57, 44, 0.08)',
            nav: 'rgba(247, 242, 232, 0.86)',
            bodyBg:
                'radial-gradient(circle at top, rgba(244, 186, 87, 0.12), transparent 30%), linear-gradient(180deg, #fbf8f2 0%, #f2eadf 100%)',
            hero:
                'linear-gradient(135deg, #17392c 0%, #244b3b 52%, #b8892d 100%)'
        },
        radius: 18,
        blur: '18px',
        primary: '#17392c',
        secondary: '#d79a38',
        mode: 'light'
    },
    classic: {
        label: 'Classic Retail',
        description: 'Traditional retail, primary blue and white',
        preview: ['#0050a4', '#ffffff', '#e30613'],
        vars: {
            forest: '#0050a4',
            ink: '#17212f',
            muted: '#5f6b7a',
            cream: '#f4f6f8',
            paper: '#ffffff',
            line: '#d8dee6',
            shadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
            nav: '#ffffff',
            bodyBg: '#f4f6f8',
            hero:
                'linear-gradient(135deg, #0050a4 0%, #0068c9 72%, #e30613 100%)'
        },
        radius: 6,
        blur: '0px',
        primary: '#0050a4',
        secondary: '#e30613',
        mode: 'light'
    }
};

export const defaultThemeMode = 'glass';

export const normalizeThemeMode = (mode) =>
    themeModes[mode] ? mode : defaultThemeMode;

export const createBrandTheme = (mode = defaultThemeMode) => {
    const tokens = themeModes[normalizeThemeMode(mode)];

    return createTheme({
        palette: {
            mode: tokens.mode,
            primary: {
                main: tokens.primary,
                contrastText: tokens.mode === 'dark' ? '#0b0b0b' : '#fff'
            },
            secondary: {
                main: tokens.secondary,
                contrastText: tokens.vars.ink
            },
            background: {
                default: tokens.vars.cream,
                paper: tokens.vars.paper
            },
            text: {
                primary: tokens.vars.ink,
                secondary: tokens.vars.muted
            },
            success: {
                main: tokens.mode === 'dark' ? '#8bcf9b' : '#2f7d57'
            },
            error: {
                main: tokens.mode === 'dark' ? '#ff8a80' : '#b9473f'
            }
        },
        typography: {
            fontFamily: 'var(--font-body)',
            h1: { fontFamily: 'var(--font-display)' },
            h2: { fontFamily: 'var(--font-display)' },
            h3: { fontFamily: 'var(--font-display)' },
            h4: { fontFamily: 'var(--font-display)', fontWeight: 700 },
            h5: { fontFamily: 'var(--font-display)', fontWeight: 700 },
            h6: { fontWeight: 800 }
        },
        shape: {
            borderRadius: tokens.radius
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        background: 'var(--brand-body-bg)',
                        color: 'var(--brand-ink)'
                    }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: 'var(--brand-paper)',
                        border: '1px solid var(--brand-line)',
                        boxShadow: 'var(--brand-shadow)',
                        backdropFilter: `blur(${tokens.blur})`
                    }
                }
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'var(--brand-paper)',
                        border: '1px solid var(--brand-line)',
                        boxShadow: 'var(--brand-shadow)'
                    }
                }
            },
            MuiButton: {
                defaultProps: {
                    disableElevation: true
                },
                styleOverrides: {
                    root: {
                        borderRadius: tokens.radius,
                        fontWeight: 800,
                        textTransform: 'none'
                    },
                    containedPrimary: {
                        backgroundColor: 'var(--brand-forest)',
                        color: tokens.mode === 'dark' ? '#0b0b0b' : '#fff',
                        '&:hover': {
                            backgroundColor: 'var(--brand-forest)'
                        }
                    },
                    outlinedPrimary: {
                        borderColor: 'var(--brand-line)',
                        color: 'var(--brand-forest)',
                        '&:hover': {
                            borderColor: 'var(--brand-forest)',
                            backgroundColor: 'rgba(127, 127, 127, 0.08)'
                        }
                    }
                }
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        color: 'var(--brand-forest)'
                    }
                }
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 'var(--brand-radius-pill)',
                        fontWeight: 700
                    }
                }
            },
            MuiTabs: {
                styleOverrides: {
                    root: {
                        minHeight: 40
                    },
                    indicator: {
                        height: 3,
                        borderRadius: 'var(--brand-radius-pill)',
                        backgroundColor: 'var(--brand-forest)'
                    }
                }
            },
            MuiTab: {
                styleOverrides: {
                    root: {
                        color: 'var(--brand-muted)',
                        fontWeight: 800,
                        textTransform: 'none',
                        '&.Mui-selected': {
                            color: 'var(--brand-forest)'
                        }
                    }
                }
            },
            MuiPaginationItem: {
                styleOverrides: {
                    root: {
                        borderRadius: tokens.radius,
                        color: 'var(--brand-ink)',
                        '&.Mui-selected': {
                            backgroundColor: 'var(--brand-forest)',
                            color: tokens.mode === 'dark' ? '#0b0b0b' : '#fff',
                            '&:hover': {
                                backgroundColor: 'var(--brand-forest)'
                            }
                        }
                    }
                }
            },
            MuiTableContainer: {
                styleOverrides: {
                    root: {
                        borderRadius: tokens.radius,
                        overflow: 'hidden'
                    }
                }
            },
            MuiTableHead: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'rgba(127, 127, 127, 0.1)'
                    }
                }
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: tokens.radius,
                        backgroundColor: 'var(--brand-paper)'
                    }
                }
            }
        }
    });
};

export default createBrandTheme;
