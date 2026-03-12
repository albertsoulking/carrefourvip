import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import api from '../../routes/api';
import { enqueueSnackbar } from 'notistack';

export default function ModalEditConfig({ open, data, setOpen, id }) {
    const [jsonValue, setJsonValue] = useState('');

    useEffect(() => {
        if (!open) return;

        setJsonValue(data);
    }, [open]);

    const handleSave = async () => {
        try {
            const parsed = JSON.parse(jsonValue);
            const formatted = JSON.stringify(parsed, null, 2);

            const payload = {
                id,
                config: formatted
            };
            
            await api.gateway.update(payload);
            enqueueSnackbar('配置已更新!', {
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
    
    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth={'md'}>
            <DialogTitle>支付网关配置JSON格式</DialogTitle>
            <DialogContent dividers>
                <Editor
                    height={400}
                    defaultLanguage={'json'}
                    value={jsonValue}
                    onChange={(value) => setJsonValue(value)}
                    options={{
                        automaticLayout: true,
                        formatOnPaste: true,
                        formatOnType: true,
                        minimap: { enabled: false }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        setOpen(false);
                    }}
                    variant={'outlined'}
                    color={'default'}
                    sx={{ width: 100 }}>
                    关闭
                </Button>
                <Button
                    onClick={handleSave}
                    variant={'contained'}
                    color={'primary'}
                    sx={{ width: 100 }}>
                    保存更改
                </Button>
            </DialogActions>
        </Dialog>
    );
}
