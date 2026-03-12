export const orderPermission = [
    {
        key: 'order.add',
        name: '新建订单',
        description: '创建一个新的客户订单',
        menu: 'order.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'order.view',
        name: '查看订单',
        description: '查看客户订单的详细',
        menu: 'order.list',
        roles: ['admin', 'agent', 'head', 'team']
    },
    {
        key: 'order.setRemark',
        name: '设置备注',
        description: '为订单设置备注信息',
        menu: 'order.list',
        roles: ['admin', 'agent', 'head', 'team']
    },
    {
        key: 'order.changeDeliveryMethod',
        name: '更改配送方式',
        description: '更改客户订单的配送方式',
        menu: 'order.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'order.changeOrderStatus',
        name: '更改订单状态',
        description: '更改客户的订单状态',
        menu: 'order.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'order.changePaymentStatus',
        name: '更改支付状态',
        description: '更改客户的订单支付状态',
        menu: 'order.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'order.changePayMethod',
        name: '更改支付类型',
        description: '更改客户的订单支付类型',
        menu: 'order.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'order.setPaymentLink',
        name: '设置支付链接',
        description: '设置支付链接让客户支付订单',
        menu: 'order.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'order.rejectOrder',
        name: '拒绝订单',
        description: '拒绝已支付的订单',
        menu: 'order.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'order.cancelOrder',
        name: '取消订单',
        description: '取消未支付的订单',
        menu: 'order.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'order.placeOrder',
        name: '下订购单',
        description: '手动为客户启动订单流程',
        menu: 'order.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'order.delete',
        name: '删除订单',
        description: '软删除该订单',
        menu: 'order.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'order.delete.view',
        name: '查看订单',
        description: '查看已删除订单的详细',
        menu: 'order.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'order.delete.restore',
        name: '恢复订单',
        description: '恢复已删除的订单',
        menu: 'order.list',
        roles: ['admin', 'agent']
    }
];
