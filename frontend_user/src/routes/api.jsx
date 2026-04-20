import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

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
            enqueueSnackbar('Login Expired, Please Login Again!', {
                variant: 'error'
            });

            if (!isRedirectedToLogin && typeof window !== 'undefined') {
                isRedirectedToLogin = true;
                localStorage.removeItem('token');
                // localStorage.removeItem('is_auth');
                localStorage.removeItem('user');
                // window.location.href = '/login';
            }
        } else if (res?.status >= 500) {
            enqueueSnackbar('Server error, please try later.', {
                variant: 'error'
            });
        }

        return Promise.reject(error);
    }
);

// api route
const auth = {
    login: (payload) => route.post('/auth/user/login', payload),
    register: (payload) => route.post('/users/register', payload),
    logout: (payload) => route.post('/auth/logout', payload),
    changePassword: (payload) => route.post('/auth/change-password', payload)
};

const users = {
    getOne: (payload) => route.post(`/users/get-one-user`, payload),
    updateOne: (payload) => route.post(`/users/update-one-user`, payload)
};

const header = {
    getStatus: (payload) => route.post('/get-header-status', payload)
};

const orders = {
    getOne: (payload) => route.post('/orders/get-one-order', payload),
    updateOne: (payload) => route.post(`/orders/update-order`, payload),
    updateStatus: (payload) => route.post('/orders/update-status', payload),
    createOne: (payload) => route.post('/orders/create-one', payload),
    getMyOrders: (payload) => route.post(`/orders/get-my-orders`, payload),
    deleteOrder: (payload) => route.post('/orders/delete-order', payload),
    getPayOrder: (payload) => route.post('/orders/get-pay-order', payload),
    updatePayOrder: (payload) => route.post('/orders/update-pay-order', payload)
};

const tickets = {
    createOne: (payload) => route.post('/tickets/create-ticket', payload),
    getAll: (payload) => route.post('/tickets/get-my-tickets', payload),
    read: (payload) => route.post('/tickets/read-ticket', payload)
};

const categories = {
    getAll: (payload) => route.post('/categories/get-all-categories', payload),
    get: (payload) => route.post('/categories/get-one-category', payload)
};

const products = {
    getAll: (payload) => route.post('/products/get-all-products', payload),
    get: (payload) => route.post('/products/get-product', payload)
};

const paypal = {
    createOrder: (payload) => route.post('/paypal/create', payload),
    captureOrder: (payload) => route.post(`/paypal/capture`, payload)
};

const locations = {
    createOne: (payload) => route.post('/locations/create-location', payload),
    updateOne: (payload) => route.post(`/locations/update-location`, payload),
    getMyLocations: (payload) =>
        route.post('/locations/get-my-locations', payload),
    deleteOne: (payload) => route.post('/locations/delete-location', payload)
};

const utilities = {
    upload: (payload) =>
        route.post('/utility/upload/image', payload, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
};

const favorites = {
    createOne: (payload) => route.post('/favorites/create-favorite', payload),
    deleteOne: (payload) => route.post('/favorites/delete-favorite', payload),
    getAll: (payload) => route.post('/favorites/get-all-favorites', payload),
    getMyFavorites: (payload) =>
        route.post('/favorites/get-my-favorites', payload)
};

const carts = {
    getAll: (payload) => route.post('/carts/get-my-carts', payload),
    createOne: (payload) => route.post('/carts/create-cart', payload),
    updateQuantity: (payload) =>
        route.post('/carts/update-cart-quantity', payload),
    deleteOne: (payload) => route.post('/carts/delete-cart', payload),
    buyAgain: (payload) => route.post('/carts/buy-again', payload)
};

const stripe = {
    checkoutOrder: (payload) => route.post('/stripe/checkout', payload)
};

const lemon = {
    checkoutOrder: (payload) => route.post('/lemon/checkout', payload)
};

const transaction = {
    getMyTransaction: (payload) =>
        route.post('/transactions/get-my-transactions', payload),
    updateOne: (payload) =>
        route.post('/transactions/update-one-transaction', payload)
};

const settings = {
    get: (payload) => route.post('/settings/get-setting', payload)
};

const pay2s = {
    create: (payload) => route.post('/pay2s/create', payload)
};

const starPay = {
    create: (payload) => route.post('/star-pay/create-order', payload)
};

const ip = {
    get: (payload) => route.post('/ip/get-ip', payload)
};

const twoFactor = {
    sendEmail: (payload) => route.post('/two-factor/send-email', payload),
    verifyEmail: (payload) => route.post('/two-factor/verify-email', payload)
};

const event = {
    getAll: (payload) => route.post('/events/get-all-events', payload),
    get: (payload) => route.post('/events/get-one-event', payload),
    getResult: (payload) => route.post('/events/get-event-result', payload),
    setResult: (payload) => route.post('/events/set-event-result', payload),
    claimReward: (payload) => route.post('/events/claim-event-reward', payload)
};

const gateway = {
    getAll: (payload) => route.post('/payment-gateway/get-all-gateways', payload),
    get: (payload) => route.post('/payment-gateway/get-one-gateway', payload)
};

const flight = {
    search: (payload) => route.post('/flights/search', payload),
    createBooking: (payload) => route.post('/flights/create-booking', payload),
    getAllBooking: (payload) => route.post('/flights/get-all-booking', payload)
};

const api = {
    route,
    auth,
    users,
    orders,
    tickets,
    categories,
    products,
    paypal,
    locations,
    utilities,
    favorites,
    carts,
    stripe,
    lemon,
    transaction,
    settings,
    pay2s,
    starPay,
    ip,
    twoFactor,
    header,
    event,
    gateway,
    flight
};

export default api;
