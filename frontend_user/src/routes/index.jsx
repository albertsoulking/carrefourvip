import web from './web';

// main
import HomePage from '../pages/home';
import PrivacyPolicyPage from '../pages/privacy';
import CookiePolicyPage from '../pages/cookie';
import ProfilePage from '../pages/profile';
import ProductPage from '../pages/product';
import PaymentSuccessPage from '../pages/payment_success';
import PaymentCancelPage from '../pages/payment_cancel';
import WalletPage from '../pages/wallet';
import TopUpSuccessPage from '../pages/topup_success';
import TopUpCancelPage from '../pages/topup_cancel';
import AboutPage from '../pages/about';
import MessagePage from '../pages/message';
import PaymentPage from '../pages/payment';
import ProductDetailPage from '../pages/product_detail';
import AddressPage from '../pages/address';
import OrderDetailPage from '../pages/order_detail';
import PaymentSubmitPage from '../pages/payment_submit';
import PaymentPay2sPage from '../pages/payment_pay2s';
import FavoritePage from '../pages/favorites';
import OrderPage from '../pages/orders';
import ActivityPage from '../pages/event';
import EventPage from '../pages/event';
import EventDetailPage from '../pages/event_detail';
import LoginPage from '../pages/login';
import RegisterPage from '../pages/register';
import NotFoundPage from '../pages/not_found';
import FlightPage from '../pages/flights';

const routes = [
    { path: web.login, element: <LoginPage /> },
    { path: web.register, element: <RegisterPage /> },
    { path: web.any, element: <NotFoundPage /> },
    { path: web.home, element: <HomePage /> },
    { path: web.privacy, element: <PrivacyPolicyPage /> },
    { path: web.cookie, element: <CookiePolicyPage /> },
    { path: web.profile, element: <ProfilePage /> },
    { path: web.paySuccess(':id'), element: <PaymentSuccessPage /> },
    { path: web.payCancel(':id'), element: <PaymentCancelPage /> },
    { path: web.products, element: <ProductPage /> },
    { path: web.productDetail(':id'), element: <ProductDetailPage /> },
    { path: web.wallet, element: <WalletPage /> },
    { path: web.topSuccess(':id'), element: <TopUpSuccessPage /> },
    { path: web.topCancel(':id'), element: <TopUpCancelPage /> },
    { path: web.about, element: <AboutPage /> },
    { path: web.messages, element: <MessagePage /> },
    { path: web.payment(':id'), element: <PaymentPage /> },
    { path: web.address, element: <AddressPage /> },
    { path: web.orderDetail(':id'), element: <OrderDetailPage /> },
    { path: web.paySubmit(':id'), element: <PaymentSubmitPage /> },
    { path: web.pay2s, element: <PaymentPay2sPage /> },
    { path: web.favorite, element: <FavoritePage /> },
    { path: web.order, element: <OrderPage /> },
    { path: web.event, element: <EventPage /> },
    { path: web.eventDetail(':id'), element: <EventDetailPage /> },
    { path: web.flight, element: <FlightPage />}
];

export default routes;
