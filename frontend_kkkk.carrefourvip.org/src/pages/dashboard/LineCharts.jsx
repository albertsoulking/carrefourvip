import { Grid, Paper, Typography } from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    ResponsiveContainer // ✅ 需要加这个
} from 'recharts';
import RowAvatar from './RowAvatar';
import i18n from '../../config/i18n';

const LineCharts = ({ data, t }) => {
    const BEAUTIFUL_COLORS = [
        '#FF6B6B', // 红
        '#FFD93D', // 黄
        '#6BCB77', // 绿
        '#4D96FF', // 蓝
        '#845EC2', // 紫
        '#FF9671', // 橙
        '#FFC75F', // 淡黄
        '#F9F871', // 柠檬
        '#0081CF', // 深蓝
        '#C34A36', // 棕红
        '#2C73D2', // 冷蓝
        '#008F7A' // 青绿
    ];

    // 生成颜色映射（国家 => 颜色）
    const generateColorMapFromPalette = (data) => {
        const shuffledColors = [...BEAUTIFUL_COLORS].sort(
            () => Math.random() - 0.5
        );
        const colorMap = {};

        for (let i = 0; i < data.length; i++) {
            const name = data[i].name;
            colorMap[name] = shuffledColors[i % shuffledColors.length]; // 超出长度就重复用
        }

        return colorMap;
    };

    const colorMap = generateColorMapFromPalette(
        data?.countryDistribution || []
    );

    const renderCustomProductTick = ({ x, y, payload }) => {
        return (
            <foreignObject
                x={x - 50}
                y={y - 20}
                width={40}
                height={40}>
                <RowAvatar imageUrl={payload.value} />
            </foreignObject>
        );
    };

    const CustomProductTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { name, sales } = payload[0].payload;

            return (
                <div
                    style={{
                        background: '#fff',
                        padding: '8px 12px',
                        border: '1px solid #ccc',
                        borderRadius: 8
                    }}>
                    <strong>{name}</strong>
                    <div>
                        {t('dashboard.lineChart.sale')}: {sales}
                    </div>
                </div>
            );
        }
        return null;
    };

    const getOrdinal = (n) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const CustomUserGrowthTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { date, count } = payload[0].payload;
            const day = i18n.language === 'en-US' ? getOrdinal(date) : date;

            return (
                <div
                    style={{
                        background: '#fff',
                        padding: '8px 12px',
                        border: '1px solid #ccc',
                        borderRadius: 8
                    }}>
                    <strong>{t('dashboard.lineChart.date', { day })}</strong>
                    <div>
                        {count} {t('dashboard.lineChart.people')}
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomDailyRevenueTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { date, amount } = payload[0].payload;
            const day = i18n.language === 'en-US' ? getOrdinal(date) : date;

            return (
                <div
                    style={{
                        background: '#fff',
                        padding: '8px 12px',
                        border: '1px solid #ccc',
                        borderRadius: 8
                    }}>
                    <strong>{t('dashboard.lineChart.date', { day })}</strong>
                    <div>€ {amount}</div>
                </div>
            );
        }
        return null;
    };

    return (
        <Grid
            container
            spacing={2}
            my={2}>
            {/* 收入趋势折线图 */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                    sx={{
                        p: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        '&:hover': {
                            boxShadow:
                                '0 6px 24px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0,0,0,0.08)'
                        }
                    }}>
                    <Typography
                        fontSize={16}
                        color={'text.secondary'}
                        gutterBottom>
                        {t('dashboard.lineChart.revenueDaily')}
                    </Typography>
                    <ResponsiveContainer
                        width={'100%'}
                        height={300}>
                        <LineChart data={data?.revenueDaily}>
                            <XAxis dataKey={'date'} />
                            <YAxis />
                            <Tooltip content={<CustomDailyRevenueTooltip />} />
                            <Line
                                type={'monotone'}
                                dataKey={'amount'}
                                stroke={'#1976d2'}
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>

            {/* 订单状态饼图 */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                    sx={{
                        p: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        '&:hover': {
                            boxShadow:
                                '0 6px 24px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0,0,0,0.08)'
                        }
                    }}>
                    <Typography
                        fontSize={16}
                        color={'text.secondary'}
                        gutterBottom>
                        {t('dashboard.lineChart.countryDistribution')}
                    </Typography>
                    <ResponsiveContainer
                        width={'100%'}
                        height={300}>
                        <PieChart>
                            <Pie
                                data={data?.countryDistribution}
                                dataKey={'value'}
                                nameKey={'name'}
                                cx={'50%'}
                                cy={'50%'}
                                outerRadius={100}
                                labelLine={true}
                                label={({ name, percent }) =>
                                    `${name} (${(percent * 100).toFixed(0)}%)`
                                }>
                                {data?.countryDistribution.map(
                                    (entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={colorMap[entry.name]}
                                        />
                                    )
                                )}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>

            {/* 新用户增长柱状图 */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                    sx={{
                        p: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        '&:hover': {
                            boxShadow:
                                '0 6px 24px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0,0,0,0.08)'
                        }
                    }}>
                    <Typography
                        fontSize={16}
                        color={'text.secondary'}
                        gutterBottom>
                        {t('dashboard.lineChart.userDailyGrowth')}
                    </Typography>
                    <ResponsiveContainer
                        width={'100%'}
                        height={300}>
                        <BarChart data={data?.userDailyGrowth}>
                            <XAxis dataKey={'date'} />
                            <YAxis />
                            <Tooltip content={<CustomUserGrowthTooltip />} />
                            <Bar
                                dataKey={'count'}
                                fill={'#82ca9d'}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>

            {/* 热销产品条形图 */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                    sx={{
                        p: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        '&:hover': {
                            boxShadow:
                                '0 6px 24px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0,0,0,0.08)'
                        }
                    }}>
                    <Typography
                        fontSize={16}
                        color={'text.secondary'}
                        gutterBottom>
                        {t('dashboard.lineChart.topProducts')}
                    </Typography>
                    <ResponsiveContainer
                        width={'100%'}
                        height={300}>
                        <BarChart
                            layout={'vertical'}
                            data={data?.topProducts}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type={'number'} />
                            <YAxis
                                dataKey={'image'}
                                type={'category'}
                                tick={renderCustomProductTick}
                                width={60}
                            />
                            <Tooltip content={<CustomProductTooltip />} />
                            <Bar
                                dataKey={'sales'}
                                fill={'#8884d8'}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default LineCharts;
