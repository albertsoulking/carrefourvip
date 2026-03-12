export const ticketPermission = [
    {
        key: 'ticket.view',
        name: '查看工单',
        description: '查看工单的消息内容',
        menu: 'message.list',
        roles: ['admin', 'agent', 'support']
    },
    {
        key: 'ticket.changeStatus',
        name: '更改状态',
        description: '更改工单状态来结束此工单的会话内容',
        menu: 'message.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'ticket.delete',
        name: '删除工单',
        description: '删除客户发来的工单',
        menu: 'message.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'ticket.delete.view',
        name: '查看工单',
        description: '查看已删除的客户工单',
        menu: 'message.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'ticket.delete.restore',
        name: '删除工单',
        description: '恢复已删除的客户工单',
        menu: 'message.list',
        roles: ['admin', 'agent']
    }
];
