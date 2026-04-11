export const actionBarPaperSx = {
    p: { xs: 1, sm: 2 },
    mb: 2,
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    borderRadius: 2,
    gap: 2,
    '& .action-bar-actions-row': {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1.5,
        width: '100%'
    },
    '& .action-bar-actions-group': {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        gap: 1,
        flex: '1 1 320px',
        minWidth: 0
    },
    '& .action-bar-actions-group:first-of-type': {
        flex: '1 1 420px'
    },
    '& .action-bar-actions-group:last-of-type': {
        flex: { xs: '1 1 100%', md: '0 0 auto' },
        justifyContent: { xs: 'flex-start', md: 'flex-end' },
        marginLeft: { xs: 0, md: 'auto' }
    },
    '& .action-bar-actions-row .MuiButton-root': {
        minHeight: 36,
        minWidth: { xs: '100%', sm: 120 },
        flex: { xs: '1 1 100%', sm: '0 1 auto' },
        px: 1.75,
        whiteSpace: 'nowrap',
        mr: '0 !important',
        ml: '0 !important'
    }
};
