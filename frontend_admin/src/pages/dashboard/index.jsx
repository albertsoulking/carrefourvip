import { Box } from '@mui/material';
import Overview from './OverView';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import LineCharts from './LineCharts';
import { DataGrid } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import getColumns from './columns';
import { useTranslation } from '../../../node_modules/react-i18next';
import useNotificationSocket from '../../hooks/useNotificationSocket';

const DashboardPage = () => {
    const { t } = useTranslation();
    const [overview, setOverview] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const res = await api.dashbaord.getOverView();
        setOverview(res.data);
    };

    useNotificationSocket((noti) => {
        if (!noti) return;
        if (noti.enableNoti === 0) return;

        loadData();
    });

    // 扁平化数据，处理时间格式
    const rows = overview?.recentOrders.map((order) => ({
        ...order,
        userName: order.user.name,
        userEmail: order.user.email,
        createdAt: new Date(order.createdAt).toLocaleString(),
        paidAt: order.paidAt ? new Date(order.paidAt).toLocaleString() : '-',
        parentName: order.user.parent.name,
        userMode: order.user.mode
    }));

    return (
        <Box p={2}>
            <Overview
                data={overview}
                t={t}
            />
            <LineCharts
                data={overview}
                t={t}
            />
            <motion.div style={{ width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={getColumns({
                        t
                    })}
                    pageSize={5} // 显示5条
                    pagination={false} // 关闭分页控件
                    disableColumnMenu // 关闭列菜单（可选）
                    disableColumnFilter // 关闭列过滤器
                    disableColumnSelector // 关闭列选择器
                    disableSelectionOnClick // 点击行时不选中
                    disableColumnSorting // 关闭列排序
                    hideFooter // 隐藏底部页脚（包含分页信息）
                    getRowId={(row) => row.id}
                    getRowHeight={() => 'auto'}
                    sx={{
                        border: 0,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        '& .MuiDataGrid-columnHeaders': {
                            fontSize: 12
                        },
                        '& .MuiDataGrid-virtualScroller': {
                            minHeight: '200px'
                        },
                        '& .MuiDataGrid-footerContainer': {},
                        '& .MuiDataGrid-cell': {
                            display: 'flex',
                            alignItems: 'center',
                            py: 0.5
                        }
                    }}
                />
            </motion.div>
        </Box>
    );
};

export default DashboardPage;
