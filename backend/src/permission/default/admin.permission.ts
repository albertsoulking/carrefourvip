export const adminPermissions = [
    {
        key: 'admin.add',
        name: '添加管理员',
        description: '添加新管理员',
        menu: 'admin.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'admin.editName',
        name: '编辑名称',
        description: '编辑管理员的名称',
        menu: 'admin.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'admin.changeEmail',
        name: '更换邮箱',
        description: '更换管理员的邮箱地址',
        menu: 'admin.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'admin.changeStatus',
        name: '启用/禁用',
        description: '更改管理员的状态-是否可以登录网站',
        menu: 'admin.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'admin.changeReferralCode',
        name: '更换邀请码',
        description: '更换管理员的邀请码',
        menu: 'admin.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'admin.setRemark',
        name: '设置备注',
        description: '为管理员设置备注信息',
        menu: 'admin.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'admin.changeParent',
        name: '转移上级',
        description: '转移管理员的上级',
        menu: 'admin.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'admin.changePassword',
        name: '更改密码',
        description: '更改管理员的账号密码',
        menu: 'admin.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'admin.delete',
        name: '删除管理员',
        description: '软删除该管理员',
        menu: 'admin.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'admin.changeRole',
        name: '更改角色',
        description: '更改当前角色',
        menu: 'admin.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'admin.editPermission',
        name: '编辑权限',
        description: '编辑管理员的个人权限',
        menu: 'admin.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'admin.delete.restore',
        name: '恢复管理员',
        description: '恢复已删除的管理员',
        menu: 'admin.list',
        roles: ['admin', 'agent']
    }
];
