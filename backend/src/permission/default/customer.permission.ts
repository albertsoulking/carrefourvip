export const customerPermissions = [
    {
        key: 'customer.add',
        name: '添加客户',
        description: '添加新正式客户',
        menu: 'customer.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'customer.view',
        name: '查看客户',
        description: '查看客户详细',
        menu: 'customer.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'customer.edit',
        name: '编辑客户',
        description: '编辑客户信息',
        menu: 'customer.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'customer.editName',
        name: '编辑名称',
        description: '编辑客户的名称',
        menu: 'customer.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'customer.changeEmail',
        name: '更换邮箱',
        description: '更换客户的邮箱地址',
        menu: 'customer.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'customer.editPhone',
        name: '编辑电话',
        description: '编辑客户的电话号码',
        menu: 'customer.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'customer.editBalance',
        name: '编辑余额',
        description: '编辑客户的账户余额',
        menu: 'customer.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'customer.changeStatus',
        name: '启用/禁用',
        description: '更改客户的状态-是否可以登录网站',
        menu: 'customer.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'customer.setRemark',
        name: '设置备注',
        description: '为客户设置备注信息',
        menu: 'customer.list',
        roles: ['admin', 'agent', 'head', 'team']
    },
    {
        key: 'customer.changeParent',
        name: '转移上级',
        description: '转移客户的上级',
        menu: 'customer.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'customer.changeUserMode',
        name: '更改类型',
        description: '更改客户的账号类型',
        menu: 'customer.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'customer.changePassword',
        name: '更改密码',
        description: '更改客户的账号密码',
        menu: 'customer.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'customer.delete',
        name: '删除客户',
        description: '软删除该客户',
        menu: 'customer.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'customer.delete.restore',
        name: '恢复客户',
        description: '恢复已删除的客户',
        menu: 'customer.list',
        roles: ['admin', 'agent']
    }
];
