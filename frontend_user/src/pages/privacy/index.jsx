import { Grid, Typography } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import web from '../../routes/web';
import TopNavigator from '../layout/TopNavigator';

const PrivacyPolicyPage = () => {
    const text = [
        {
            title: 'Privacy Policy & Terms of Service',
            text: 'Welcome to Zenviquea! By using our website, you agree to the following Terms and Conditions. We recommend reading them carefully to understand your rights and responsibilities as a user.'
        },
        {
            title: 'Acceptance of Terms',
            text: 'By accessing or using the Zenviquea website, you confirm that you are at least 18 years of age and agree to comply with and be bound by these Terms and Conditions. If you disagree with any part of these terms, please discontinue your use of our services.'
        },
        {
            title: 'User Accounts',
            lists: [
                {
                    title: 'Account Creation',
                    text: 'To place orders on Zenviquea, you need to create an account. You are responsible for maintaining the confidentiality of your login details.'
                },
                {
                    title: 'Eligibility',
                    text: 'Only individuals who are at least 18 years old are eligible to create an account. Parents or guardians may place orders on behalf of minors but must assume responsibility for all interactions and payments.'
                },
                {
                    title: 'Account Security',
                    text: "Please ensure your account details are secure. Zenviquea cannot be held liable for unauthorized access resulting from the user's negligence."
                }
            ]
        },
        {
            title: 'Ordering and Payment',
            lists: [
                {
                    title: 'Order Placement',
                    text: 'Orders can be placed through our online platform. Please double-check all order details, such as address, item selection, and payment method, before confirming.'
                },
                {
                    title: 'Payment',
                    text: 'Zenviquea accepts major credit/debit cards, online payment gateways, and other secure payment methods. All prices are inclusive of applicable taxes and service fees.'
                },
                {
                    title: 'Order Confirmation',
                    text: 'Upon payment, you will receive an email confirmation detailing your order. Please review this email to ensure accuracy.'
                }
            ]
        },
        {
            title: 'Cancellation and Refunds',
            lists: [
                {
                    title: 'Order Cancellations',
                    text: 'Once an order is confirmed, it may not be eligible for cancellation due to the nature of food preparation. However, you can reach out to our support team for assistance.'
                },
                {
                    title: 'Refund Policy',
                    text: 'If Zenviquea or the restaurant is unable to fulfill your order, you may be eligible for a full or partial refund, based on the circumstances. Please refer to our Refund Policy for detailed guidelines.'
                }
            ]
        },
        {
            title: 'Delivery Policy',
            lists: [
                {
                    title: 'Delivery Times',
                    text: 'Estimated delivery times are provided at checkout but may vary due to traffic, weather, or restaurant preparation time.'
                },
                {
                    title: 'Delivery Area and Limitations',
                    text: 'Zenviquea currently serves designated areas, and orders outside these locations may not be fulfilled.'
                },
                {
                    title: 'Delivery Responsibility',
                    text: 'Zenviquea works with trusted delivery partners; however, we are not responsible for delays or issues occurring after the order leaves the restaurant.'
                }
            ]
        },
        {
            title: 'Food Quality and Safety',
            lists: [
                {
                    title: 'Restaurant Liability',
                    text: 'Zenviquea is a platform connecting users with local restaurants. We are not responsible for the quality, freshness, or any health concerns related to the food provided by restaurants.'
                },
                {
                    title: 'Allergies and Dietary Needs',
                    text: "It is the user's responsibility to communicate any food allergies or dietary requirements directly with the restaurant."
                }
            ]
        },
        {
            title: 'Intellectual Property Rights',
            lists: [
                {
                    title: 'Ownership',
                    text: 'All content, logos, and branding on the Zenviquea website are the property of Zenviquea. Unauthorized use, reproduction, or distribution of any material is prohibited.'
                },
                {
                    title: 'User Contributions',
                    text: 'If you submit feedback, reviews, or other content, you grant Zenviquea a non-exclusive, royalty-free, and perpetual license to use, modify, and distribute your content for promotional purposes.'
                }
            ]
        },
        {
            title: 'Prohibited Conduct',
            lists: [
                {
                    title: 'Inappropriate Use',
                    text: 'You agree not to engage in fraudulent activities, place orders with false information, disrupt the platform, or misuse any features of the website.'
                },
                {
                    title: 'Content Standards',
                    text: 'Offensive or harmful content, including abusive language in reviews, is strictly prohibited.'
                }
            ]
        },
        {
            title: 'Privacy Policy',
            lists: [
                {
                    title: 'Data Collection',
                    text: 'We collect personal information necessary for order processing, payment, and delivery.'
                },
                {
                    title: 'Data Use and Sharing',
                    text: 'Your information is kept secure and is shared only with necessary third-party service providers. For full details, please review our Privacy Policy.'
                }
            ]
        },
        {
            title: 'Modifications to Terms',
            lists: [
                {
                    title: 'Terms Revisions',
                    text: 'Zenviquea reserves the right to update these Terms and Conditions at any time. Changes will be effective upon posting on this page. Continued use of the website after modifications signifies your acceptance of the updated terms.'
                }
            ]
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
                title={'Privacy Policy'}
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

export default PrivacyPolicyPage;
