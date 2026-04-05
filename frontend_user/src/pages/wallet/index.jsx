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
    Pagination
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import { useSearchParams } from 'react-router-dom';
import ModalTopUp from './ModalTopUp';
import web from '../../routes/web';
import useStyledLocaleString from '../../hooks/useStyledLocaleString';
import { useSmartNavigate } from '../../hooks/useSmartNavigate';
import TopNavigator from '../layout/TopNavigator';

export default function WalletPage() {
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
        'Transaction History', // 0
        'Top Up History', // 1
        'Refund History' // 2
    ];

    useEffect(() => {
        loadUserData();
        loadTransData(page ?? 1, limit ?? 12, type ?? 0);
        setTab(type ? Number(type) : 0);
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
        loadTransData(1, limit ?? 12, newValue);
    };

    return (
        <Box
            mt={8}
            px={2}>
            <TopNavigator
                backText={'Profile'}
                backPath={web.profile}
                title={'My Wallet'}
            />
            <Paper
                sx={{
                    p: 3,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
                elevation={2}>
                <Box>
                    <Typography variant={'h6'}>Wallet Balance</Typography>
                    <Typography
                        variant={'h4'}
                        color={'action'}
                        fontWeight={'bold'}
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
                    {/* <Button
                            variant={'contained'}
                            color={'warning'}
                            size={'small'}
                            onClick={() => setOpenTopUp(true)}>
                            Top up
                        </Button> */}
                    {/* <Button
                            variant={'text'}
                            color={'warning'}
                            size={'small'}>
                            Set password
                        </Button> */}
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
                        minWidth: 'auto'
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
                    sx={{ height: '100%', mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontSize: 14 }}>
                                    Status
                                </TableCell>
                                <TableCell sx={{ fontSize: 14 }}>
                                    Amount
                                </TableCell>
                                <TableCell sx={{ fontSize: 14 }}>
                                    Post Balance
                                </TableCell>
                                <TableCell sx={{ fontSize: 14 }}>
                                    Date
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactionData.data.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell
                                        sx={{
                                            color:
                                                t.status === 'completed'
                                                    ? 'royalblue'
                                                    : t.status === 'cancelled'
                                                    ? 'red'
                                                    : t.status === 'refunded'
                                                    ? 'purple'
                                                    : 'gray',
                                            fontSize: 12
                                        }}>
                                        {t.status}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            color:
                                                t.status === 'pending'
                                                    ? 'gray'
                                                    : t.direction === 'in'
                                                    ? 'green'
                                                    : 'red',
                                            fontSize: 12
                                        }}
                                        translate={'no'}>
                                        {t.status === 'pending'
                                            ? ''
                                            : t.direction === 'in'
                                            ? '+'
                                            : '-'}
                                        {useStyledLocaleString(
                                            Math.abs(t.amount),
                                            user?.geoInfo
                                        )}
                                    </TableCell>
                                    <TableCell
                                        sx={{ fontSize: 12 }}
                                        translate={'no'}>
                                        {t.postBalance
                                            ? useStyledLocaleString(
                                                  t.postBalance,
                                                  user?.geoInfo
                                              )
                                            : '--'}
                                    </TableCell>
                                    <TableCell
                                        sx={{ fontSize: 12 }}
                                        translate={'no'}>
                                        {new Date(
                                            t.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
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
                    count={transactionData.lastPage}
                    page={Number(page)}
                    onChange={(e, newPage) => {
                        loadTransData(newPage, limit, type);
                    }}
                />
            </Box>

            <ModalTopUp
                open={openTopUp}
                setOpen={setOpenTopUp}
            />
        </Box>
    );
}
