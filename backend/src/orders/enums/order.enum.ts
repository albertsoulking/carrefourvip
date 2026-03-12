export enum DeliveryMethod {
    STANDARD='standard',
    EXPRESS='express'
};

export enum OrderStatus { // user | admin
    PENDING = 'pending', // Waiting for payment | cancel order, pay now | -
    PROCESSING = 'processing', // Payment done, preparing to ship | - | mark as shipped
    SHIPPED = 'shipped', // Handed over to courier | confirm delivery | mask as delivered
    DELIVERED = 'delivered', // Confirmed received | delete order | -
    CANCELLED = 'cancelled', // Cancelled before shipping | delete order | -
    REFUNDED = 'refunded' // Refunded after delivery | delete order | -
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
}
