import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
    Button
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import { useSearchParams } from 'react-router-dom';
import ModalTopUp from './ModalTopUp';
import web from '../../routes/web';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import TopNavigator from '../layout/TopNavigator';
import { useTranslation } from 'react-i18next';

export default function WalletPage() {
    const { t } = useTranslation();
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useSmartNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const type = searchParams.get('type');
    const [tab, setTab] = useState(0);
    const [openTopUp, setOpenTopUp] = useState(false);
    const [userBalance, setUserBalance] = useState(null);
    const [transactionData, setTransactionData] = useState({
        data: [],
        page: 1,
        lastPage: 0
    });

    const tabStatus = [
        t('wallet.tabs.transactionHistory'),
        t('wallet.tabs.topUpHistory'),
        t('wallet.tabs.refundHistory')
    ];

    useEffect(() => {
        loadUserData();
        const lim = Number(limit) || 12;
        const pg = Math.max(1, Number(page) || 1);
        const ty =
            type !== null && type !== undefined && type !== ''
                ? Number(type)
                : 0;
        loadTransData(pg, lim, ty);
        setTab(ty);
    }, [searchParams]);

    const loadUserData = async () => {
        if (!user) return;
        const resUser = await api.users.getOne({ id: user?.id });
        setUserBalance(resUser.data.balance);
    };

    const loadTransData = async (pageValue, limitValue, typeValue) => {
        const payload = {
            page: Number(pageValue),
            limit: Number(limitValue),
            type: Number(typeValue)
        };

        setSearchParams(payload);

        const res = await api.transaction.getMyTransaction(payload);
        setTransactionData(res.data);
    };

    const handleChange = (event, newValue) => {
        setTab(newValue);
        const lim = Number(limit) || 12;
        loadTransData(1, lim, newValue);
    };

    const limitNum = Number(limit) || 12;
    const pageNum = Math.max(1, Number(page) || 1);
    const typeNum =
        type !== null && type !== undefined && type !== '' ? Number(type) : 0;

    const postBalanceLabel =
        tab === 1
            ? t('wallet.table.balanceAfterCredit')
            : t('wallet.table.postBalance');

    const formatPostBalanceCell = (row) => {
        if (row.status === 'completed') {
            const bal = row.afterBalance ?? row.postBalance;
            return bal ? useStyledLocaleString(bal, user?.geoInfo) : '—';
        }
        if (row.status === 'pending') {
            return '—';
        }
        if (row.status === 'cancelled') {
            return '—';
        }
        return row.postBalance
            ? useStyledLocaleString(row.postBalance, user?.geoInfo)
            : '—';
    };

    const formatAmountCell = (row) => {
        const pendingIn =
            row.status === 'pending' &&
            row.direction === 'in' &&
            row.type === 'deposit';
        const sign =
            pendingIn || row.direction === 'in'
                ? '+'
                : row.direction === 'out'
                  ? '-'
                  : '';
        const color =
            row.status === 'pending'
                ? pendingIn
                    ? 'green'
                    : 'gray'
                : row.direction === 'in'
                  ? 'green'
                  : 'red';
        return { sign, color };
    };

    return (
        <Box
            sx={{
                pt: 'var(--app-top-bar-space)',
                px: 2,
                pb: 4,
                minHeight: '100vh',
                bgcolor: 'var(--brand-cream)'
            }}>
            <TopNavigator
                backText={t('wallet.backText')}
                backPath={web.profile}
                title={t('wallet.title')}
            />
            <Paper
                sx={{
                    p: 3,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 'var(--brand-radius-xl)',
                    background: 'var(--brand-hero)',
                    color: '#fff'
                }}
                elevation={0}>
                <Box>
                    <Typography variant={'h6'}>
                        {t('wallet.balance')}
                    </Typography>
                    <Typography
                        variant={'h4'}
                        fontWeight={'bold'}
                        sx={{
                            color: '#fff',
                            fontFamily: 'var(--font-display)'
                        }}
                        translate={'no'}>
                        {userBalance
                            ? useStyledLocaleString(userBalance, user?.geoInfo)
                            : '--'}
                    </Typography>
                </Box>
                <Box
                    display={'flex'}
                    flexDirection={'column'}
                    gap={2}>
                    <Button
                        variant={'contained'}
                        color={'warning'}
                        size={'small'}
                        onClick={() => setOpenTopUp(true)}>
                        Top up
                    </Button>
                    <Button
                        variant={'text'}
                        color={'warning'}
                        size={'small'}>
                        A good choice
                    </Button>
                </Box>
            </Paper>

            <Box sx={{ width: '100%' }}>
                <Tabs
                    value={tab}
                    onChange={handleChange}
                    variant={'scrollable'}
                    scrollButtons='auto'
                    sx={{
                        minHeight: 'auto',
                        minWidth: 'auto',
                        bgcolor: 'var(--brand-paper)',
                        border: '1px solid var(--brand-line)',
                        borderRadius: 'var(--brand-radius-md)',
                        boxShadow: 'var(--brand-shadow)'
                    }}
                    allowScrollButtonsMobile>
                    {tabStatus.map((label) => (
                        <Tab
                            key={label}
                            label={label}
                            sx={{
                                minHeight: 'auto',
                                minWidth: 'auto',
                                overflow: 'auto',
                                textTransform: 'capitalize'
                            }}
                        />
                    ))}
                </Tabs>
                {/* 交易记录表格 */}
                <TableContainer
                    component={Paper}
                    sx={{
                        height: '100%',
                        mt: 2,
                        borderRadius: 'var(--brand-radius-lg)'
                    }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontSize: 14 }}>
                                    {t('wallet.table.status')}
                                </TableCell>
                                <TableCell sx={{ fontSize: 14 }}>
                                    {t('wallet.table.reference')}
                                </TableCell>
                                <TableCell sx={{ fontSize: 14 }}>
                                    {t('wallet.table.amount')}
                                </TableCell>
                                <TableCell sx={{ fontSize: 14 }}>
                                    {postBalanceLabel}
                                </TableCell>
                                <TableCell sx={{ fontSize: 14 }}>
                                    {t('wallet.table.date')}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactionData.data.map((row) => {
                                const amtFmt = formatAmountCell(row);
                                return (
                                    <TableRow key={row.id}>
                                        <TableCell
                                            sx={{
                                                color:
                                                    row.status === 'completed'
                                                        ? 'royalblue'
                                                        : row.status ===
                                                            'cancelled'
                                                          ? 'red'
                                                          : row.status ===
                                                              'refunded'
                                                            ? 'purple'
                                                            : 'gray',
                                                fontSize: 12
                                            }}>
                                            {row.status}
                                        </TableCell>
                                        <TableCell
                                            sx={{ fontSize: 12 }}
                                            translate={'no'}>
                                            {row.transactionNumber || '—'}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                color: amtFmt.color,
                                                fontSize: 12
                                            }}
                                            translate={'no'}>
                                            {amtFmt.sign}
                                            {useStyledLocaleString(
                                                Math.abs(row.amount),
                                                user?.geoInfo
                                            )}
                                        </TableCell>
                                        <TableCell
                                            sx={{ fontSize: 12 }}
                                            translate={'no'}>
                                            {formatPostBalanceCell(row)}
                                        </TableCell>
                                        <TableCell
                                            sx={{ fontSize: 12 }}
                                            translate={'no'}>
                                            {new Date(
                                                row.createdAt
                                            ).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <Box
                my={2}
                display={'flex'}
                justifyContent={'center'}
                translate={'no'}>
                <Pagination
                    count={transactionData.lastPage || 1}
                    page={pageNum}
                    onChange={(e, newPage) => {
                        loadTransData(newPage, limitNum, typeNum);
                    }}
                />
            </Box>

            <ModalTopUp
                open={openTopUp}
                setOpen={setOpenTopUp}
                user={user}
                onDepositCreated={() => {
                    setTab(1);
                    loadTransData(1, limitNum, 1);
                    loadUserData();
                }}
            />
        </Box>
    );
}
