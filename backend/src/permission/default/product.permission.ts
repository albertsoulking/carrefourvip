export const productPermission = [
    {
        key: 'product.add',
        name: '添加商品',
        description: '添加新商品',
        menu: 'product.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'product.view',
        name: '查看商品',
        description: '查看商品细节',
        menu: 'product.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'product.edit',
        name: '编辑商品',
        description: '编辑商品内容',
        menu: 'product.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'product.changeAvailable',
        name: '启用/禁用',
        description: '更改商品状态是否启用/禁用',
        menu: 'product.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'product.delete',
        name: '删除商品',
        description: '软删除该商品',
        menu: 'product.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'product.delete.view',
        name: '查看商品',
        description: '查看已删除的商品详细',
        menu: 'product.list',
        roles: ['admin', 'agent']
    },
    {
        key: 'product.delete.restore',
        name: '恢复商品',
        description: '恢复已删除的商品',
        menu: 'product.list',
        roles: ['admin', 'agent']
    }
];
