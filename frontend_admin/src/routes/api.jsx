import axios from 'axios';
import web from './web';
import useSmartNavigate from '../hooks/useSmartNavigate';

let isRedirectedToLogin = false;

const route = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
});

route.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

route.interceptors.response.use(
    (response) => response,
    (error) => {
        const res = error.response;
        if (res?.status === 401 || res?.data?.message === 'Unauthenticated') {
            if (!isRedirectedToLogin && typeof window !== 'undefined') {
                isRedirectedToLogin = true;

                localStorage.removeItem('token');
                localStorage.removeItem('is_auth');
                localStorage.removeItem('user');

                window.alert('请刷新并重新登录！');
                const navigate = useSmartNavigate();
                navigate(web.login);
            }
        }

        return Promise.reject(error);
    }
);

// api route
const auth = {
    login: (payload) => route.post('/auth/admin/login', payload),
    logout: (payload) => route.post('/auth/logout', payload),
    changePassword: (payload) => route.post('/auth/change-password', payload)
};

const dashbaord = {
    getOverView: (payload) =>
        route.post('/admin/dashboard/get-dashboard-overview', payload)
};

const user = {
    getAll: (payload) => route.post('/admin/users/get-all-users', payload),
    update: (payload) => route.post('/admin/users/update-user', payload),
    create: (payload) => route.post('/admin/users/create-user', payload),
    changePassword: (payload) =>
        route.post('/admin/users/change-password', payload),
    delete: (payload) => route.post('/admin/users/delete-user', payload),
    getDeleted: (payload) =>
        route.post('/admin/users/get-deleted-users', payload),
    restore: (payload) => route.post('/admin/users/restore-user', payload)
};

const roleMenu = {
    getRoles: (payload) => route.post('/admin/role-menus/get-roles', payload),
    getMenusByPermission: (payload) =>
        route.post('/admin/role-menus/get-menus-by-permission', payload),
    getMenus: (payload) => route.post('/admin/role-menus/get-menus', payload),
    updateMenusByRole: (payload) =>
        route.post('/admin/role-menus/update-menus-by-role', payload),
    resetRoleMneu: (payload) =>
        route.post('/admin/role-menus/reset-role-menus', payload),
    getAdminAccess: (payload) =>
        route.post('/admin/role-menus/get-admin-access', payload),
    updateAdminAccess: (payload) =>
        route.post('/admin/role-menus/update-admin-access', payload)
};

const agent = {
    findAdmins: (payload) => route.post('/admin/find-admins', payload),
    getAdmins: (payload) => route.post('/admin/get-all-admins', payload),
    createAdmin: (payload) => route.post('/admin/create-admin', payload),
    updateAdmins: (payload) => route.post('/admin/update-admin', payload),
    changePassword: (payload) => route.post('/admin/change-password', payload),
    getMembers: (payload) => route.post('/admin/get-members', payload),
    changeRole: (payload) => route.post('/admin/change-role', payload),
    delete: (payload) => route.post('/admin/delete-admin', payload),
    getDeleted: (payload) => route.post('/admin/get-deleted-admins', payload),
    restore: (payload) => route.post('/admin/restore-admin', payload),
    updateProfile: (payload) => route.post('/admin/update-profile', payload)
};

const product = {
    getAll: (payload) =>
        route.post('/admin/products/get-all-products', payload),
    create: (payload) => route.post('/admin/products/create-product', payload),
    update: (payload) => route.post('/admin/products/update-product', payload),
    delete: (payload) => route.post('/admin/products/delete-product', payload),
    getDeleted: (payload) =>
        route.post('/admin/products/get-deleted-products', payload),
    restore: (payload) => route.post('/admin/products/restore-product', payload)
};

const category = {
    getAll: (payload) =>
        route.post('/admin/categories/get-all-categories', payload),
    update: (payload) =>
        route.post('/admin/categories/update-category', payload),
    get: (payload) => route.post('/admin/categories/get-categories', payload),
    create: (payload) =>
        route.post('/admin/categories/create-category', payload),
    delete: (payload) =>
        route.post('/admin/categories/delete-category', payload),
    getDeleted: (payload) =>
        route.post('/admin/categories/get-deleted-categories', payload),
    restore: (payload) =>
        route.post('/admin/categories/restore-category', payload)
};

const utilities = {
    upload: (payload) =>
        route.post('/utility/upload/image', payload, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }),
        genrateThumbnail: (payload) =>
        route.post('/utility/generate/thumbnail', payload),
    init: (payload) => route.post('/utility/init-website', payload),
    ping: (payload) => route.get('/utility/ping', payload)
};

const orders = {
    getAll: (payload) => route.post('/admin/orders/get-all-orders', payload),
    update: (payload) => route.post('/admin/orders/update-order', payload),
    updateUserOrder: (payload) => route.post('/orders/update-status', payload),
    delete: (payload) => route.post('/admin/orders/delete-order', payload),
    getDeleted: (payload) =>
        route.post('/admin/orders/get-deleted-orders', payload),
    restore: (payload) => route.post('/admin/orders/restore-order', payload),
    create: (payload) => route.post('/admin/orders/create-order', payload)
};

const flightBooking = {
    getAll: (payload) =>
        route.post(
            '/admin/flight-bookings/get-all-flight-bookings',
            payload
        ),
    update: (payload) => route.post('/admin/flight-bookings/update-flight-booking', payload)
};

const transactions = {
    getAll: (payload) =>
        route.post('/admin/transactions/get-all-transactions', payload),
    approveBankDeposit: (payload) =>
        route.post('/admin/transactions/approve-bank-deposit', payload),
    rejectBankDeposit: (payload) =>
        route.post('/admin/transactions/reject-bank-deposit', payload),
    adjustBalance: (payload) =>
        route.post('/admin/transactions/adjust-balance', payload)
};

const settings = {
    // getAll: (payload) =>
    //     route.post('/admin/settings/get-all-settings', payload),
    // getGroup: (payload) =>
    //     route.post('/admin/settings/get-group-settings', payload),
    // create: (payload) => route.post('/admin/settings/create-setting', payload),
    update: (payload) => route.post('/admin/settings/update-setting', payload),
    get: (payload) => route.post('/admin/settings/get-setting', payload),
    reset: (payload) => route.post('/admin/settings/reset-setting', payload)
    // delete: (payload) => route.post('/admin/settings/delete-setting', payload),
    // updateAll: (payload) =>
    //     route.post('/admin/settings/update-all-settings', payload),
    // resetDelivery: (payload) =>
    //     route.post('/admin/settings/reset-delivery-setting', payload),
    // resetSite: (payload) =>
    //     route.post('/admin/settings/reset-site-setting', payload)
};

const permission = {
    reset: (payload) =>
        route.post('/admin/permissions/reset-permission', payload)
};

const log = {
    getAll: (payload) => route.post('/admin/system-log/get-logs', payload)
};

const activity = {
    getAll: (payload) =>
        route.post('/admin/login-activities/get-login-activities', payload)
};

const ticket = {
    getAll: (payload) => route.post('/admin/tickets/get-all-tickets', payload),
    update: (payload) => route.post('/admin/tickets/update-ticket', payload),
    delete: (payload) => route.post('/admin/tickets/delete-ticket', payload),
    getDeleted: (payload) =>
        route.post('/admin/tickets/get-deleted-tickets', payload),
    restore: (payload) => route.post('/admin/tickets/restore-ticket', payload)
};

const message = {
    getAll: (payload) =>
        route.post('/admin/messages/get-all-messages', payload),
    send: (payload) => route.post('/admin/messages/send-message', payload),
    delete: (payload) => route.post('/admin/messages/delete-message', payload)
};

const noti = {
    getAll: (payload) =>
        route.post('/system-noti/get-all-notifications', payload),
    update: (payload) =>
        route.post('/system-noti/update-notification', payload),
    markAllasRead: (payload) =>
        route.post('/system-noti/mark-all-as-read', payload)
};

const twoFactor = {
    verifyAdmin: (payload) => route.post('/two-factor/verify-admin', payload),
    generate2FA: (payload) =>
        route.post('/two-factor/generate-2fa-secret', payload),
    verify2FA: (payload) => route.post('/two-factor/verify-2fa', payload),
    remove2FA: (payload) => route.post('/two-factor/remove-2fa', payload)
};

const event = {
    create: (payload) => route.post('/admin/events/create-event', payload),
    getAll: (payload) => route.post('/admin/events/get-all-events', payload)
};

const luckyWheel = {
    create: (payload) =>
        route.post('/admin/lucky-wheel/create-lucky-wheel', payload),
    getAll: (payload) =>
        route.post('/admin/lucky-wheel/get-all-lucky-wheels', payload),
    findAll: (payload) =>
        route.post('/admin/lucky-wheel/find-all-lucky-wheels', payload)
};

const gateway = {
    create: (payload) =>
        route.post('admin/payment-gateways/create-payment-gateway', payload),
    getAll: (payload) =>
        route.post('admin/payment-gateways/get-all-payment-gateways', payload),
    update: (payload) =>
        route.post('admin/payment-gateways/update-payment-gateway', payload)
};

const provider = {
    getAll: (payload) =>
        route.post('admin/payment-providers/get-all-providers', payload),
    reset: (payload) =>
        route.post('admin/payment-providers/reset-providers', payload)
};

const api = {
    route,
    auth,
    dashbaord,
    user,
    roleMenu,
    agent,
    product,
    category,
    utilities,
    orders,
    flightBooking,
    transactions,
    settings,
    permission,
    log,
    activity,
    ticket,
    message,
    noti,
    twoFactor,
    event,
    luckyWheel,
    gateway,
    provider
};

export default api;
