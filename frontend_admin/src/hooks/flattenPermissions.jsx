export const flattenPermissions = (menus) => {
    let result = [];

    for (const menu of menus) {
        if (menu.permissions?.length)
            result.push(...menu.permissions.map((p) => p.key));
        if (menu.children?.length)
            result.push(...flattenPermissions(menu.children));
    }
    return result;
};
