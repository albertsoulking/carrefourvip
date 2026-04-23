import { Grid, Typography } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import web from '../../routes/web';
import TopNavigator from '../layout/TopNavigator';

const CookiePolicyPage = () => {
    const text = [
        {
            title: 'Cookie Policy',
            text: 'This Cookie Policy explains how Zenviquea uses cookies and similar technologies on our website. By using our site, you consent to our use of cookies in accordance with this policy. Please read this document carefully to understand how we use cookies, the information we collect, and how you can manage your cookie preferences.'
        },
        {
            title: 'What Are Cookies?',
            text: 'Cookies are small text files that are stored on your device (computer, tablet, smartphone) when you visit a website. They help websites remember your preferences, login information, and browsing behavior, allowing for a more personalized user experience.'
        },
        {
            title: 'Types of Cookies We Use',
            notes: [
                {
                    title: 'Essential Cookies',
                    text: 'These cookies are necessary for the website to function properly. They enable core features such as user authentication, security, and accessibility. Without these cookies, certain features of the website may not function as intended.'
                },
                {
                    title: 'Performance and Analytics Cookies',
                    text: 'We use these cookies to understand how visitors interact with our website. They help us analyze website traffic, user behavior, and optimize performance. Information collected by these cookies is aggregated and anonymous.'
                },
                {
                    title: 'Functional Cookies',
                    text: 'Functional cookies allow our website to remember your preferences, such as language or location, to provide a more tailored experience.'
                },
                {
                    title: 'Advertising and Targeting Cookies',
                    text: 'These cookies are used to display relevant advertisements based on your browsing history and preferences. They track your activity on our website and across other websites, enabling us and third-party providers to deliver personalized ads.'
                }
            ]
        },
        {
            title: 'How We Use Cookies',
            lists: [
                {
                    title: 'Enhancing User Experience',
                    text: 'Cookies help us remember your preferences and improve the ease of use on Zenviquea.'
                },
                {
                    title: 'Tracking Performance',
                    text: 'We use cookies to gather insights on website performance, helping us optimize functionality and content.'
                },
                {
                    title: 'Personalizing Advertising',
                    text: 'Cookies allow us and third-party partners to show relevant ads that align with your interests.'
                }
            ]
        },
        {
            title: 'Third-Party Cookies',
            text: 'Zenviquea may work with third-party service providers who use cookies on our website. These providers help us with analytics, advertising, and social media integration. Third-party cookies are governed by the privacy policies of these providers, and we recommend reviewing their policies for more information.'
        },
        {
            title: 'Contact Us',
            text: 'If you have any questions about these Terms and Conditions, please contact us at support@Zenviquea.com or through the Contact Us page on our website.'
        }
    ];

    return (
        <Grid
            container
            direction={'column'}
            sx={{
                mt: 8,
                mb: 4,
                px: 2
            }}>
            <TopNavigator
                backText={'Profile'}
                backPath={web.profile}
                title={'Cookie Policy'}
            />
            {text.map((item, index) => (
                <Grid key={index}>
                    <Typography
                        fontSize={18}
                        fontWeight={'bold'}
                        sx={{ mt: 2, color: '#383838' }}>
                        {item.title}
                    </Typography>
                    <Typography
                        fontSize={14}
                        sx={{ color: '#3a3a3f' }}>
                        {item.text}
                    </Typography>
                    {item.notes &&
                        item.notes.map((nItem, nIndex) => (
                            <Grid
                                key={nIndex}
                                sx={{ mb: 0.5 }}>
                                <Typography>
                                    <span
                                        style={{
                                            fontWeight: 'bold',
                                            color: '#383838'
                                        }}>
                                        {nItem.title}:
                                    </span>
                                    &nbsp;
                                    <span style={{ fontSize: 14 }}>
                                        {nItem.text}
                                    </span>
                                </Typography>
                            </Grid>
                        ))}
                    {item.lists &&
                        item.lists.map((lItem, lIndex) => (
                            <Grid
                                key={lIndex}
                                container
                                flexWrap={'nowrap'}
                                sx={{ mb: 0.5 }}>
                                <CircleIcon
                                    sx={{
                                        fontSize: 6,
                                        mt: 1.2,
                                        ml: 3.8,
                                        mr: 1.5,
                                        color: '#383838'
                                    }}
                                />
                                <Typography>
                                    <span
                                        style={{
                                            fontWeight: 'bold',
                                            color: '#383838'
                                        }}>
                                        {lItem.title}:
                                    </span>
                                    &nbsp;
                                    <span
                                        style={{
                                            fontSize: 14,
                                            color: '#666666'
                                        }}>
                                        {lItem.text}
                                    </span>
                                </Typography>
                            </Grid>
                        ))}
                </Grid>
            ))}
        </Grid>
    );
};

export default CookiePolicyPage;
