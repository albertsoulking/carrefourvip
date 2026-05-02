export enum TransactionDirection {
    IN = 'in',
    OUT = 'out',
};

export enum TransactionType {
    DEPOSIT = 'deposit',
    WITHDRAWAL = 'withdrawal',
    ORDER_PAYMENT = 'order_payment',
    ADJUSTMENT = 'adjustment'
}

export enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
}

export enum TransactionMethod {
    STRIPE = 'stripe',
    PAYPAL = 'paypal',
    BALANCE = 'balance',
    HYBRID = 'hybrid',
    CARD = 'card',
    PAY2S = 'pay2s',
    LEMON = 'lemon',
    BEHALF = 'behalf',
    STARPAY = 'starpay',
    FAF = 'faf',
    WISE = 'wise',
    BANK_TRANSFER = 'bank_transfer'
}
