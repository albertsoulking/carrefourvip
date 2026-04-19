// default
const any = '*';
const home = '/';
const login = '/login';
const dashboard = '/dashboard';
const customer = {
    list: '/customers',
    login: '/customers/login-activity'
};
const product = {
    list: '/products',
    category: '/categories'
};
const order = {
    list: '/orders',
    delete: '/orders/deleted',
    log: '/orders/logs',
    flight: '/orders/flights'
};
const marketing = {
    event: '/events',
    wheel: '/lucky-wheels'
};
const settings = {
    site: '/settings/site',
    delivery: '/settings/delivery',
    payment: '/settings/payment',
    maintenance: '/settings/maintenance',
    integration: '/settings/integrations',
    log: '/settings/logs',
    role: '/settings/roles'
};
const finance = {
    order: '/finance/order-payment',
    deposit: '/finance/deposit'
};
const message = {
    list: '/messages'
};
const admin = {
    list: '/admins',
    login:'/admins/login-activity',
    delete: '/admins/deleted'
};

const web = {
    any,
    home,
    dashboard,
    login,
    customer,
    product,
    order,
    settings,
    finance,
    message,
    admin,
    marketing
};

export default web;
