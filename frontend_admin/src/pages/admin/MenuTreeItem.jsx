import {
    Box,
    Checkbox,
    Collapse,
    Typography,
    ListItemButton,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useState } from 'react';
import { useTranslation } from '../../../node_modules/react-i18next';

const MenuTreeItem = ({
    node,
    data,
    checkedKeys,
    onToggleMenu,
    onTogglePermission
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const allChildIds = [
        ...node.children.map((c) => `menu-${c.id}`),
        ...node.permissions.map((p) => `perm-${p.id}`)
    ];

    const checkedCount = allChildIds.filter((id) =>
        checkedKeys?.includes(id)
    ).length;
    const isIndeterminate =
        checkedCount > 0 && checkedCount < allChildIds.length;

    const hasChildrenOrPermissions =
        (node.children && node.children.length > 0) ||
        (node.permissions && node.permissions.length > 0);

    const handleMenuToggle = () => {
        onToggleMenu(node.id);
    };

    const handlePermissionToggle = (id) => {
        onTogglePermission(id);
    };

    return (
        <>
            <ListItemButton onClick={() => setOpen(!open)}>
                <ListItemIcon>
                    <Checkbox
                        checked={checkedKeys?.includes(`menu-${node.id}`)}
                        indeterminate={isIndeterminate}
                        onChange={handleMenuToggle}
                        size={'small'}
                        disabled={data?.name === 'admin' || data?.name === 'customer'}
                    />
                </ListItemIcon>
                <ListItemText primary={t(`nav.${node.name}`)} />
                {hasChildrenOrPermissions &&
                    (open ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
            <Collapse
                in={open}
                timeout={'auto'}
                unmountOnExit>
                <Box pl={4}>
                    {node.permissions?.map((perm) => (
                        <Box
                            key={perm.id}
                            display={'flex'}
                            alignItems={'center'}>
                            <Checkbox
                                checked={checkedKeys?.includes(
                                    `perm-${perm.id}`
                                )}
                                onChange={() => handlePermissionToggle(perm.id)}
                                size={'small'}
                                disabled={data?.name === 'admin' || data?.name === 'customer'}
                            />
                            <Typography fontSize={13}>{perm.name} - {perm.description}</Typography>
                        </Box>
                    ))}
                    
                    {node.children?.map((child) => (
                        <MenuTreeItem
                            key={child.id}
                            node={child}
                            data={data}
                            checkedKeys={checkedKeys}
                            onToggleMenu={onToggleMenu}
                            onTogglePermission={onTogglePermission}
                        />
                    ))}
                </Box>
            </Collapse>
        </>
    );
};

export default MenuTreeItem;
