export const maintenancePermission = [
    {
        key: 'maintenance.generateThumbnails',
        name: '批量生成缩略图',
        description: '',
        menu: 'setting.maintenance',
        roles: ['admin']
    },
    {
        key: 'maintenance.resetPermissions',
        name: '重置权限',
        description: '重置角色权限，不包括个人权限',
        menu: 'setting.maintenance',
        roles: ['admin']
    },
    {
        key: 'maintenance.resetMenus',
        name: '重置菜单',
        description: '重置角色菜单，不包括个人菜单',
        menu: 'setting.maintenance',
        roles: ['admin']
    },
    {
        key: 'maintenance.resetPaymentProviders',
        name: '重置支付网关',
        description: '恢复默认支付网关，不包括个人支付网关配置',
        menu: 'setting.maintenance',
        roles: ['admin']
    }
];
