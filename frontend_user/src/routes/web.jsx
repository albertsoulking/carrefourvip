// default
const any = "*";
const home = "/";
const defaultWeb = {
    any,
    home,
};

// main
const login = "/login";
const register = "/register";
const check = "/check";
const privacy = "/privacy-policy";
const cookie = "/cookie-policy";
const products = '/products';
const productDetail = id => `${products}/${id}/detail`;
const profile = '/profile';
const payment = id => `/pay/${id}`;
const paySuccess = id => `/payment/${id}/success`;
const payCancel = id => `/payment/${id}/cancel`;
const paySubmit = id => `/payment/${id}/submit`;
const pay2s = '/payment/pay2s';
const wallet = `${profile}/my-wallet`;
const topSuccess = id => `${wallet}/${id}/success`;
const topCancel = id => `${wallet}/${id}/cancel`;
const about = '/about';
const messages = `${profile}/messages`;
const address = `${profile}/address`;
const orderDetail = id => `/orders/${id}/detail`;
const favorite = '/favorites';
const order = '/orders';
const event = '/events';
const eventDetail = id => `${event}/${id}`;
const flight = '/flights';
const flightBooking = '/flight-booking';

const mainWeb = {
    login,
    register,
    check,
    privacy,
    cookie,
    products,
    productDetail,
    profile,
    payment,
    paySuccess,
    payCancel,
    wallet,
    topSuccess,
    topCancel,
    about,
    messages,
    address,
    orderDetail,
    paySubmit,
    pay2s,
    favorite,
    order,
    event,
    eventDetail,
    flight,
    flightBooking
};

const web = {
    ...defaultWeb,
    ...mainWeb
};

export default web;
