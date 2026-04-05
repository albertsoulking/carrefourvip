import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import MenuTreeItem from './MenuTreeItem';
import { enqueueSnackbar } from 'notistack';

const ModalUpdateMenu = ({ open, data, setOpen, permissions }) => {
    const [menuTree, setMenuTree] = useState([]);
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [permissionToMenuMap, setPermissionToMenuMap] = useState({});
    const [menuToPermissionMap, setMenuToPermissionMap] = useState({});

    useEffect(() => {
        if (data?.id) fetchMenuData();
    }, [open]);

    const fetchMenuData = async () => {
        const res = await api.roleMenu.getMenusByPermission({ id: data?.id });
        setMenuTree(res.data.menuData);
        setCheckedKeys([
            ...res.data.checkedMenuIds.map((id) => `menu-${id}`),
            ...res.data.checkedPermissionIds.map((id) => `perm-${id}`)
        ]);

        const menuMap = {};
        const permissionMap = {};

        const findPermissionsWithMenus = (menus) => {
            for (const menu of menus) {
                if (menu.children?.length > 0) {
                    findPermissionsWithMenus(menu.children);
                }

                if (menu.permissions?.length > 0) {
                    menu.permissions.forEach((perm) => {
                        menuMap[perm.id] = menu.id;
                    });
                }
            }
        };

        const findMenusWithPermissions = (menus) => {
            for (const menu of menus) {
                if (menu.children?.length > 0) {
                    findMenusWithPermissions(menu.children);
                }

                if (menu.permissions?.length > 0) {
                    permissionMap[menu.id] = menu.permissions.map(
                        (perm) => perm.id
                    );
                }
            }
        };

        findPermissionsWithMenus(res.data.menuData);
        findMenusWithPermissions(res.data.menuData);
        setPermissionToMenuMap(menuMap);
        setMenuToPermissionMap(permissionMap);
    };

    const handleOnClose = () => {
        setOpen({ open: false, data: null });
        setCheckedKeys([]);
        setMenuTree([]);
    };

    const handleSave = async () => {
        const payload = {
            id: data?.id,
            menuIds: checkedKeys
                .filter((id) => id.startsWith('menu-'))
                .map((id) => Number(id.split('-')[1])),
            permissionIds: checkedKeys
                .filter((id) => id.startsWith('perm-'))
                .map((id) => Number(id.split('-')[1]))
        };

        try {
            await api.roleMenu.updateMenusByRole(payload);
            handleOnClose();
            enqueueSnackbar('权限更新成功!', {
                variant: 'success'
            });
        } catch (error) {
            enqueueSnackbar(
                Array.isArray(error.response?.data?.message)
                    ? error.response.data.message[0]
                    : error.response?.data?.message || error.message,
                {
                    variant: 'error'
                }
            );
        }
    };

    const handleToggleMenu = (id) => {
        const menuId = `menu-${id}`;
        const permIds = menuToPermissionMap[id]
            ? menuToPermissionMap[id].map((pId) => `perm-${pId}`)
            : null;
        const hasPerm = permIds
            ? checkedKeys.find((key) => permIds.includes(key))
            : false;

        setCheckedKeys((prev) =>
            prev.includes(menuId)
                ? hasPerm
                    ? [...prev]
                    : prev.filter((p) => p !== menuId)
                : [...prev, menuId]
        );
    };

    const handleTogglePermission = (id) => {
        const permId = `perm-${id}`;
        const menuId = `menu-${permissionToMenuMap[id]}`;

        setCheckedKeys((prev) =>
            prev.includes(permId)
                ? prev.filter((p) => p !== permId)
                : [...prev, permId]
        );

        if (permissionToMenuMap[id]) {
            setCheckedKeys((prev) =>
                prev.includes(menuId) ? [...prev] : [...prev, menuId]
            );
        }
    };

    return (
        <Dialog
            PaperProps={{ sx: { width: 600 } }}
            open={open}
            onClose={handleOnClose}>
            <DialogTitle
                fontSize={16}
                fontWeight={700}>
                编辑权限 - {data?.description}
            </DialogTitle>
            <DialogContent dividers>
                <List dense>
                    {menuTree.map((menu) => (
                        <MenuTreeItem
                            key={menu.id}
                            node={menu}
                            data={data}
                            checkedKeys={checkedKeys}
                            onToggleMenu={handleToggleMenu}
                            onTogglePermission={handleTogglePermission}
                        />
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button
                    variant={'outlined'}
                    color={'error'}
                    size={'small'}
                    sx={{ width: 100 }}
                    onClick={handleOnClose}>
                    取消
                </Button>
                {permissions.includes('role.editPermission') && (
                    <Button
                        variant={'contained'}
                        size={'small'}
                        sx={{ width: 100 }}
                        onClick={handleSave}>
                        保存
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ModalUpdateMenu;
