export const messagePermission = [
    {
        key: 'message.send',
        name: '发送消息',
        description: '管理员给客户发送消息通知',
        menu: 'message.list',
        roles: ['admin', 'agent', 'support']
    },
    {
        key: 'message.delete',
        name: '删除消息',
        description: '删除该消息',
        menu: 'message.list',
        roles: ['admin', 'agent', 'support']
    }
];
