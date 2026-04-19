import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Stack,
    Typography
} from '@mui/material';

function formatDateTime(value) {
    if (!value) return '-';

    return new Date(value).toLocaleString();
}

const ModalViewBooking = ({ open, setOpen, data }) => {
    if (!data) return null;

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth='md'>
            <DialogTitle>查看机票预订</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={3}>
                    <Box>
                        <Typography
                            variant='h6'
                            fontWeight={700}>
                            {data.bookingReference}
                        </Typography>
                        <Stack
                            direction='row'
                            spacing={1}
                            useFlexGap
                            flexWrap='wrap'
                            mt={1}>
                            <Chip label={data.status} />
                            <Chip label={data.tripType} />
                            <Chip label={data.cabinClass} />
                            <Chip label={`${data.passengerCount} passengers`} />
                        </Stack>
                    </Box>

                    <Grid
                        container
                        spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography
                                variant='subtitle2'
                                gutterBottom>
                                航班信息
                            </Typography>
                            <Typography fontSize={13}>
                                航司: {data.airlineName || data.airlineCode}
                            </Typography>
                            <Typography fontSize={13}>
                                航线: {data.originCode} - {data.destinationCode}
                            </Typography>
                            <Typography fontSize={13}>
                                出发: {formatDateTime(data.departureAt)}
                            </Typography>
                            <Typography fontSize={13}>
                                返回: {formatDateTime(data.returnAt)}
                            </Typography>
                            <Typography fontSize={13}>
                                价格: USD {Number(data.price || 0).toFixed(2)}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography
                                variant='subtitle2'
                                gutterBottom>
                                联系信息
                            </Typography>
                            <Typography fontSize={13}>
                                联系人: {data.contactTitle || ''}{' '}
                                {data.contactFirstName} {data.contactLastName}
                            </Typography>
                            <Typography fontSize={13}>
                                邮箱: {data.contactEmail}
                            </Typography>
                            <Typography fontSize={13}>
                                电话: {data.contactPhone}
                            </Typography>
                            <Typography fontSize={13}>
                                客户: {data.user?.name || '-'} ({data.user?.email || '-'})
                            </Typography>
                        </Grid>
                    </Grid>

                    {data.specialRequests && (
                        <>
                            <Divider />
                            <Box>
                                <Typography
                                    variant='subtitle2'
                                    gutterBottom>
                                    特别要求
                                </Typography>
                                <Typography fontSize={13}>
                                    {data.specialRequests}
                                </Typography>
                            </Box>
                        </>
                    )}

                    <Divider />

                    <Box>
                        <Typography
                            variant='subtitle2'
                            gutterBottom>
                            乘客信息
                        </Typography>
                        <Stack spacing={2}>
                            {(data.passengers || []).map((passenger, index) => (
                                <Box
                                    key={`${passenger.documentNumber}-${index}`}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: 'grey.50',
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}>
                                    <Typography
                                        fontSize={13}
                                        fontWeight={700}
                                        gutterBottom>
                                        Passenger {index + 1} ({passenger.passengerType})
                                    </Typography>
                                    <Typography fontSize={13}>
                                        姓名: {passenger.title} {passenger.firstName}{' '}
                                        {passenger.lastName}
                                    </Typography>
                                    <Typography fontSize={13}>
                                        性别: {passenger.gender}
                                    </Typography>
                                    <Typography fontSize={13}>
                                        出生日期: {passenger.dateOfBirth}
                                    </Typography>
                                    <Typography fontSize={13}>
                                        国籍: {passenger.nationality}
                                    </Typography>
                                    <Typography fontSize={13}>
                                        证件: {passenger.documentType} /{' '}
                                        {passenger.documentNumber}
                                    </Typography>
                                    <Typography fontSize={13}>
                                        证件到期: {passenger.documentExpiry}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalViewBooking;
