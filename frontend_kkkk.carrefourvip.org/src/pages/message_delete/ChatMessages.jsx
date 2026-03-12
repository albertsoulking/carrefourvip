import { Box, Typography } from '@mui/material';
import ChatActions from './ChatActions';

const ChatMessages = ({
    message,
    status,
    setMessages,
    loadData,
    searchModal,
    permissions
}) => {
    const isLeft = message.senderRole?.name === 'customer';

    return (
        <Box
            mb={1}
            display={'flex'}
            alignItems={isLeft ? 'flex-start' : 'flex-end'}
            flexDirection={'column'}>
            <Typography
                variant={'subtitle2'}
                fontWeight={'bold'}
                textAlign={isLeft ? 'left' : 'right'}>
                {message.sender?.name ?? 'Unknown'}
            </Typography>
            <Box display={'flex'}>
                {!isLeft && status === 'opened' && (
                    <ChatActions
                        data={message}
                        isLeft={isLeft}
                        setMessages={setMessages}
                        loadData={loadData}
                        searchModal={searchModal}
                        permissions={permissions}
                    />
                )}
                <Box
                    width={'fit-content'}
                    sx={{
                        py: 0.5,
                        px: 1,
                        maxWidth: 400,
                        position: 'relative',
                        bgcolor: isLeft ? '#fff' : '#1976d2',
                        color: isLeft ? '#000' : '#fff',
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        borderBottomLeftRadius: isLeft ? 0 : 8,
                        borderBottomRightRadius: isLeft ? 8 : 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            width: 0,
                            height: 0,
                            border: '6px solid transparent',
                            ...(isLeft
                                ? {
                                      left: -6,
                                      borderRightColor: '#fff',
                                      borderLeft: 0,
                                      borderTop: '6px solid transparent',
                                      borderBottom: 0
                                  }
                                : {
                                      right: -6,
                                      borderLeftColor: '#1976d2',
                                      borderRight: 0,
                                      borderTop: '6px solid transparent',
                                      borderBottom: 0
                                  })
                        }
                    }}>
                    <Typography fontSize={14}>{message.content}</Typography>
                </Box>
                {/* {isLeft && <ChatActions isLeft={isLeft} />} */}
            </Box>

            <Typography
                variant={'caption'}
                textAlign={isLeft ? 'left' : 'right'}
                color={'text.secondary'}
                sx={{
                    mt: 0.5
                }}>
                {new Date(message.createdAt).toLocaleString()}
            </Typography>
        </Box>
    );
};

export default ChatMessages;
