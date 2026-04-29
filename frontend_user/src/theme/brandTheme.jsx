import { createTheme } from '@mui/material/styles';

const brandTheme = createTheme({
    palette: {
        primary: {
            main: '#17392c',
            contrastText: '#fff'
        },
        secondary: {
            main: '#d79a38',
            contrastText: '#182018'
        },
        background: {
            default: '#f7f2e8',
            paper: '#fffdfa'
        },
        text: {
            primary: '#182018',
            secondary: '#687166'
        },
        success: {
            main: '#2f7d57'
        },
        error: {
            main: '#b9473f'
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
        borderRadius: 18
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#f7f2e8'
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: '1px solid rgba(23, 57, 44, 0.08)',
                    boxShadow: '0 14px 32px rgba(23, 57, 44, 0.08)'
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#fffdfa',
                    border: '1px solid rgba(23, 57, 44, 0.08)',
                    boxShadow: '0 14px 32px rgba(23, 57, 44, 0.08)'
                }
            }
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true
            },
            styleOverrides: {
                root: {
                    borderRadius: 14,
                    fontWeight: 800,
                    textTransform: 'none'
                },
                containedPrimary: {
                    backgroundColor: '#17392c',
                    '&:hover': {
                        backgroundColor: '#17392c'
                    }
                },
                outlinedPrimary: {
                    borderColor: 'rgba(23, 57, 44, 0.26)',
                    color: '#17392c',
                    '&:hover': {
                        borderColor: '#17392c',
                        backgroundColor: 'rgba(23, 57, 44, 0.05)'
                    }
                }
            }
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    color: '#17392c'
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
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
                    borderRadius: 999,
                    backgroundColor: '#17392c'
                }
            }
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    color: '#687166',
                    fontWeight: 800,
                    textTransform: 'none',
                    '&.Mui-selected': {
                        color: '#17392c'
                    }
                }
            }
        },
        MuiPaginationItem: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    '&.Mui-selected': {
                        backgroundColor: '#17392c',
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: '#17392c'
                        }
                    }
                }
            }
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    borderRadius: 22,
                    overflow: 'hidden'
                }
            }
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#efe8db'
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 24,
                    backgroundColor: '#fffdfa'
                }
            }
        }
    }
});

export default brandTheme;
