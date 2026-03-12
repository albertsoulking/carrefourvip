import {
    Box,
    Chip,
    Typography,
    Card,
    CardActionArea,
    CardContent,
    Badge
} from '@mui/material';
import { CheckCircleRounded, CancelRounded } from '@mui/icons-material';

const MessageItem = ({ data, setOpen }) => {
    const statusMap = [
        {
            label: 'Opened',
            value: 'opened',
            icon: <CheckCircleRounded />,
            color: 'primary'
        },
        {
            label: 'Closed',
            value: 'closed',
            icon: <CancelRounded />,
            color: 'action'
        }
    ];
    return (
        <Card
            sx={{
                m: 1,
                borderRadius: 2,
                boxShadow: 'rgba(0, 0, 0, 0.1) 0 4px 12px'
            }}>
            <CardActionArea onClick={() => setOpen({ open: true, data })}>
                <CardContent sx={{ p: 1 }}>
                    <Box
                        display={'flex'}
                        alignItems={'center'}
                        justifyContent={'space-between'}>
                        <Typography
                            fontWeight={'bold'}
                            mr={1}>
                            <span translate={'no'}>{data?.subject}</span>
                        </Typography>
                        <Chip
                            label={
                                statusMap.find((s) => s.value === data?.status)
                                    ?.label
                            }
                            icon={
                                statusMap.find((s) => s.value === data?.status)
                                    ?.icon
                            }
                            color={
                                statusMap.find((s) => s.value === data?.status)
                                    ?.color
                            }
                            size={'small'}
                            sx={{ fontSize: 12 }}
                        />
                    </Box>
                    <Box
                        display={'flex'}
                        justifyContent={'space-between'}>
                        <Typography
                            fontSize={14}
                            noWrap>
                            Last Message:{' '}
                            <span translate={'no'}>
                                {data?.messages && data.messages.length > 0
                                    ? data.messages[data.messages.length - 1]
                                          .content
                                    : '-'}
                            </span>
                        </Typography>
                        <Badge
                            badgeContent={data.totalUnread}
                            color={'error'}
                            sx={{ mr: 2 }}
                            translate={'no'}
                        />
                    </Box>
                    <Box
                        display={'flex'}
                        justifyContent={'space-between'}>
                        <Typography
                            fontSize={14}
                            noWrap>
                            Reply: {data?.messages.length} message replies
                        </Typography>
                        <Typography
                            variant={'caption'}
                            color={'textSecondary'}
                            translate={'no'}>
                            {new Date(data?.createdAt).toLocaleString()}
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default MessageItem;
