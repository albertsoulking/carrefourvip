import { useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Divider,
    Grid,
    Typography
} from '@mui/material';
import assets from '../../assets';
import { AddRounded, RemoveRounded } from '@mui/icons-material';

const BannerSix = () => {
    const faqs = [
        {
            title: 'How do I track my order?',
            text: 'After placing your order, you can track its status in real time from the "My Orders" section of the app or website. You\'ll see updates like "Preparing," "Out for delivery," and "Delivered."'
        },
        {
            title: 'What payment methods are available?',
            text: 'We accept credit/debit cards, PayPal, Apple Pay, Google Pay, and select mobile wallets. Availability may vary by region and market.'
        },
        {
            title: 'How do I place an order?',
            text: 'To place an order, log in to your account. Browse the menu, add items to your cart, choose your delivery details, and proceed to checkout. After payment confirmation, your order will be sent to the market.'
        },
        {
            title: 'I was overcharged. How can I get refund?',
            text: 'If you notice an overcharge, please contact our customer support through the app or website under "Help" > "Order Issues." Provide your order number and a brief description. We\'ll review and process eligible refunds promptly.'
        },
        {
            title: 'Can I cancel or change my order after placing it?',
            text: 'You can cancel or modify your order within a few minutes after placing it, before the market starts preparing it. Go to “My Orders” > select the order > tap “Cancel” or “Contact Support.” Once preparation begins, changes may not be possible.'
        },
        {
            title: 'Are there delivery fees?',
            text: 'Yes, delivery fees vary depending on your distance from the market and current demand. Any applicable fees will be shown clearly before you confirm your order.'
        },
        {
            title: 'What if the delivery is late?',
            text: 'Occasionally delays happen due to high demand or traffic. You can track the order status live. If the delay is excessive, please contact customer support for assistance or compensation.'
        },
        {
            title: 'Do I need to create an account to order?',
            text: 'While some features may be available as a guest, creating an account lets you track orders, save addresses, and enjoy rewards or promotions.'
        }
    ];

    const payment = [
        assets.cbPay,
        assets.visaPay,
        assets.masterPay,
        assets.aePay,
        assets.passPay,
        assets.paypalPay,
        assets.plusPay,
        assets.wishPay
    ];

    const [expanded, setExpanded] = useState(false);

    const handleOnChange = (isExpanded, index) => {
        setExpanded(isExpanded ? index : false);
    };

    return (
        <Grid
            sx={{
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1
            }}>
            <Grid
                container
                direction={'column'}
                justifyContent={'center'}
                alignItems={'center'}
                sx={{
                    py: '1rem'
                }}>
                <Grid
                    container
                    direction={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    sx={{
                        width: '70%'
                    }}>
                    <Typography
                        fontSize={18}
                        color={'primary'}
                        sx={{
                            fontFamily: '"Alex Brush", cursive'
                        }}>
                        FAQ
                    </Typography>
                </Grid>
                <Grid
                    container
                    direction={'column'}
                    justifyContent={'center'}
                    alignItems={'center'}>
                    {faqs.map((item, index) => (
                        <Grid
                            key={index}
                            sx={{
                                m: 1,
                                my: 0.2,
                                width: '95%'
                            }}>
                            <Accordion
                                expanded={expanded === index}
                                sx={{
                                    minHeight: 20,
                                    m: 0,
                                    p: 1,
                                    bgcolor: 'transparent',
                                    border: '1px solid #211f281a',
                                    overflow: 'hidden',
                                    boxShadow: 'none',
                                    borderRadius: '8px !important'
                                }}
                                onChange={(e, expanded) =>
                                    handleOnChange(expanded, index)
                                }>
                                <AccordionSummary
                                    sx={{
                                        px: 1,
                                        minHeight: 20,
                                        '.Mui-expanded': { minHeight: 20, m: 0 },
                                        '&.MuiButtonBase-root-MuiAccordionSummary-root.Mui-expanded': {
                                            minHeight: 20
                                        },
                                        '.MuiAccordionSummary-content': {
                                            m: 0
                                        }
                                    }}
                                    expandIcon={
                                        expanded === index ? (
                                            <RemoveRounded
                                                sx={{
                                                    fontSize: {
                                                        xs: '1rem',
                                                        sm: '2rem'
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <AddRounded
                                                sx={{
                                                    fontSize: {
                                                        xs: '1rem',
                                                        sm: '2rem'
                                                    }
                                                }}
                                            />
                                        )
                                    }>
                                    <Typography
                                        component={'span'}
                                        fontWeight={{
                                            xs: 'normal',
                                            sm: 'bold'
                                        }}
                                        fontSize={{ xs: 14, sm: 16 }}
                                        sx={{ p: 0, m: 0 }}>
                                        {item.title}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0.5 }}>
                                    <Typography
                                        fontSize={12}
                                        sx={{ p: 0 }}>
                                        {item.text}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    ))}
                </Grid>
            </Grid>
            <Divider />
            <Grid sx={{ p: 1 }}>
                <Typography
                    mb={1}
                    fontWeight={'bold'}>
                    100% secure payment
                </Typography>
                <Box>
                    {payment.map((item, index) => (
                        <img
                            key={index}
                            src={item}
                            alt={item}
                            style={{
                                margin: '0 4px',
                                objectFit: 'cover',
                                maxHeight: '2rem',
                                maxWidth: '2rem',
                                verticalAlign: 'top',
                                width: 'auto'
                            }}
                        />
                    ))}
                </Box>
            </Grid>
            <Divider />
            <Box
                sx={{
                    p: 1,
                    display: 'flex'
                }}>
                <img
                    src={assets.alcohol_mobile}
                    alt=''
                    style={{ width: '100%', objectFit: 'cover' }}
                />
            </Box>
        </Grid>
    );
};

export default BannerSix;
