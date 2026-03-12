export const categoryPermission = [
    {
        key: 'category.add',
        name: '添加分类',
        description: '添加新商品分类',
        menu: 'product.category',
        roles: ['admin', 'agent']
    },
    {
        key: 'category.edit',
        name: '编辑分类',
        description: '编辑商品分类内容',
        menu: 'product.category',
        roles: ['admin', 'agent']
    },
    {
        key: 'category.editName',
        name: '编辑名称',
        description: '编辑商品分类名称',
        menu: 'product.category',
        roles: ['admin', 'agent']
    },
    {
        key: 'category.editDescription',
        name: '编辑描述',
        description: '编辑商品分类描述',
        menu: 'product.category',
        roles: ['admin', 'agent']
    },
    {
        key: 'category.changeActive',
        name: '启用/禁用',
        description: '更改商品分类的状态',
        menu: 'product.category',
        roles: ['admin', 'agent']
    },
    {
        key: 'category.editDisplayOrder',
        name: '编辑显示顺序',
        description: '编辑商品分类的显示顺序',
        menu: 'product.category',
        roles: ['admin', 'agent']
    },
    {
        key: 'category.editVatPercent',
        name: '编辑增值税',
        description: '编辑商品分类的增值税',
        menu: 'product.category',
        roles: ['admin', 'agent']
    },
    {
        key: 'category.changeVatCollect',
        name: '更改收税',
        description: '更改商品分类的收税状态是否启用/禁用',
        menu: 'product.category',
        roles: ['admin', 'agent']
    },
    {
        key: 'category.delete',
        name: '删除分类',
        description: '软删除该分类',
        menu: 'product.category',
        roles: ['admin', 'agent']
    },
    {
        key: 'category.delete.restore',
        name: '恢复分类',
        description: '恢复已删除的分类',
        menu: 'product.category',
        roles: ['admin', 'agent']
    }
];
