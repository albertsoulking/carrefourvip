import { Box, Card, CardContent, Typography } from '@mui/material';

/**
 * Four (or fewer) stat cards: label, primary value, optional secondary line, optional icon, optional onClick.
 * @param {Array<{ label: string, value: React.ReactNode, sub?: string, color?: string, icon?: React.ReactNode, onClick?: function }>} cards
 */
export default function StatCardsRow({ cards = [] }) {
    if (!cards.length) return null;

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(4, minmax(0, 1fr))'
                },
                gap: { xs: 1.5, sm: 2 },
                mb: 2,
                alignItems: 'stretch'
            }}>
            {cards.map((item, index) => (
                <Card
                    key={index}
                    onClick={item.onClick}
                    sx={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        position: 'relative',
                        borderRadius: 2,
                        bgcolor: '#fff',
                        minHeight: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                        cursor: item.onClick ? 'pointer' : 'default',
                        '&:hover': item.onClick
                            ? {
                                  boxShadow:
                                      '0 6px 20px rgba(0, 0, 0, 0.12)',
                                  transform: 'translateY(-1px)'
                              }
                            : {}
                    }}>
                    <CardContent
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            pt: 2,
                            pb: 2,
                            '&:last-child': { pb: 2 }
                        }}>
                        <Typography
                            color={'text.secondary'}
                            variant={'subtitle2'}
                            sx={{
                                fontSize: 13,
                                lineHeight: 1.3,
                                mb: 0.75,
                                pr: item.icon ? 4 : 0
                            }}>
                            {item.label}
                        </Typography>
                        <Typography
                            variant={'h5'}
                            component={'div'}
                            color={item.color || 'primary'}
                            fontWeight={700}
                            sx={{
                                fontSize: { xs: '1.35rem', md: '1.5rem' },
                                lineHeight: 1.2,
                                wordBreak: 'break-word'
                            }}>
                            {item.value ?? '—'}
                        </Typography>
                        {item.sub != null && item.sub !== '' && (
                            <Typography
                                variant={'caption'}
                                color={'text.secondary'}
                                sx={{ mt: 'auto', pt: 1 }}>
                                {item.sub}
                            </Typography>
                        )}
                        {item.icon ? (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    right: 12,
                                    top: 12,
                                    opacity: 0.2,
                                    pointerEvents: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                {item.icon}
                            </Box>
                        ) : null}
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
