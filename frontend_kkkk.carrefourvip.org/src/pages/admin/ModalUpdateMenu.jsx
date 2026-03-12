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
import usePermissionStore from '../../hooks/usePermissionStore';

const ModalUpdateMenu = ({ open, data, setOpen }) => {
    const permissions = usePermissionStore((state) => state.permissions);
    const [menuTree, setMenuTree] = useState([]);
    const [checkedKeys, setCheckedKeys] = useState([]);

    useEffect(() => {
        if (!open) return;
        if (!data) return;

        fetchMenuData();
    }, [open]);

    const fetchMenuData = async () => {
        const res = await api.roleMenu.getAdminAccess({ id: data?.id });

        setMenuTree(res.data.menuData);
        setCheckedKeys([
            ...res.data.checkedMenuIds.map((id) => `menu-${id}`),
            ...res.data.checkedPermissionIds.map((id) => `perm-${id}`)
        ]);
    };

    const handleOnClose = () => {
        setOpen(false);
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
            await api.roleMenu.updateAdminAccess(payload);
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

        setCheckedKeys((prev) =>
            prev.includes(menuId)
                ? prev.filter((p) => p !== menuId)
                : [...prev, menuId]
        );
    };

    const handleTogglePermission = (id) => {
        const permId = `perm-${id}`;

        setCheckedKeys((prev) =>
            prev.includes(permId)
                ? prev.filter((p) => p !== permId)
                : [...prev, permId]
        );
    };

    return (
        <Dialog
            PaperProps={{ sx: { width: 600 } }}
            open={open}>
            <DialogTitle
                fontSize={16}
                fontWeight={700}>
                编辑权限 - {data?.name}
            </DialogTitle>
            <DialogContent dividers>
                <List dense>
                    {menuTree.map((menu) => (
                        <MenuTreeItem
                            key={menu.id}
                            node={menu}
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
                {permissions.includes('admin.editPermission') && (
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
