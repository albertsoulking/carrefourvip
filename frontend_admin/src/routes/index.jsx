import web from './web';
import CustomerListPage from '../pages/customer';
import ProductListPage from '../pages/product';
import ProductCategoryListPage from '../pages/product_category';
import OrderListPage from '../pages/order';
import FlightBookingListPage from '../pages/flight_booking';
import DeliverySettingPage from '../pages/shipping';
import SettingMaintenancePage from '../pages/settings_maintenance';
import PermissionRolePage from '../pages/permission_role';
import CustomerLoginActivityPage from '../pages/customer_login';
import FinanceOrderPage from '../pages/finance_order';
import FinanceDepositPage from '../pages/finance_deposit';
import SystemLogPage from '../pages/system_log';
import DashboardPage from '../pages/dashboard';
import SettingSitePage from '../pages/site';
import SettingIntegrationPage from '../pages/integration';
import OrderLogPage from '../pages/order_log';
import MessageListPage from '../pages/message';
import AdminListPage from '../pages/admin';
import AdminLoginActivityPage from '../pages/admin_login';
import AdminDeletePage from '../pages/admin_delete';
import EventListPage from '../pages/event';
import LuckyWheelListPage from '../pages/lucky-wheel';
import PaymentListPage from '../pages/setting_payment';

const routes = [
    { path: web.dashboard, element: <DashboardPage /> },
    { path: web.customer.list, element: <CustomerListPage /> },
    { path: web.customer.login, element: <CustomerLoginActivityPage /> },
    { path: web.product.list, element: <ProductListPage /> },
    { path: web.product.category, element: <ProductCategoryListPage /> },
    { path: web.order.list, element: <OrderListPage /> },
    { path: web.order.log, element: <OrderLogPage /> },
    { path: web.order.flight, element: <FlightBookingListPage /> },
    { path: web.settings.site, element: <SettingSitePage /> },
    { path: web.settings.delivery, element: <DeliverySettingPage /> },
    { path: web.settings.payment, element: <PaymentListPage /> },
    { path: web.settings.maintenance, element: <SettingMaintenancePage /> },
    { path: web.settings.integration, element: <SettingIntegrationPage /> },
    { path: web.settings.log, element: <SystemLogPage /> },
    { path: web.settings.role, element: <PermissionRolePage /> },
    { path: web.finance.order, element: <FinanceOrderPage /> },
    { path: web.finance.deposit, element: <FinanceDepositPage /> },
    { path: web.message.list, element: <MessageListPage /> },
    { path: web.admin.list, element: <AdminListPage /> },
    { path: web.admin.login, element: <AdminLoginActivityPage /> },
    { path: web.admin.delete, element: <AdminDeletePage /> },
    { path: web.marketing.event, element: <EventListPage /> },
    { path: web.marketing.wheel, element: <LuckyWheelListPage /> }
];

export default routes;
