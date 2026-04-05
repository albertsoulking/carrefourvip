import { DeleteRounded, UploadRounded } from '@mui/icons-material';
import {
    Avatar,
    Box,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { useRef, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import ReactQuill from 'react-quill';

const InputField = ({ field, value, onChange }) => {
    const inputRef = useRef();
    const [previewUrl, setPreviewUrl] = useState('');

    return (
        <Box>
            {field.element === 'text' && (
                <TextField
                    {...field}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.name, e.target.value)}
                    fullWidth
                    margin={'normal'}
                />
            )}
            {field.element === 'select' && (
                <FormControl
                    margin={'normal'}
                    fullWidth>
                    <InputLabel>
                        {field.label}
                        {field.required ? ' *' : ''}
                    </InputLabel>
                    <Select
                        {...field}
                        value={value || ''}
                        onChange={(e) =>
                            onChange(e.target.name, e.target.value)
                        }>
                        {field.children.map((child) => (
                            <MenuItem
                                value={child.value}
                                key={child.value}>
                                {child.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
            {field.element === 'image' && (
                <Box
                    display={'flex'}
                    alignItems={'center'}
                    gap={1}>
                    {/* Hidden File Input */}
                    <input
                        ref={inputRef}
                        type={'file'}
                        accept={'image/*'}
                        onChange={(e) => {
                            const uploadedFile = e.target.files?.[0];
                            if (uploadedFile) {
                                onChange(field.name, uploadedFile);
                                setPreviewUrl(
                                    URL.createObjectURL(uploadedFile)
                                );
                            }
                        }}
                        style={{ display: 'none' }}
                    />
                    {/* Fake TextField */}
                    <TextField
                        {...field}
                        fullWidth
                        margin={'normal'}
                        value={value?.name || ''}
                        InputProps={{
                            readOnly: true,
                            startAdornment: previewUrl && (
                                <InputAdornment position={'start'}>
                                    <Avatar
                                        src={previewUrl}
                                        variant={'rounded'}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            mr: 1
                                        }}
                                    />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position={'end'}>
                                    {value && (
                                        <IconButton
                                            onClick={() => {
                                                onChange(field.name, null);
                                                setPreviewUrl('');
                                                inputRef.current.value = '';
                                            }}
                                            sx={{ mr: -1 }}>
                                            <DeleteRounded />
                                        </IconButton>
                                    )}
                                    <IconButton
                                        onClick={() => inputRef.current.click()}
                                        sx={{ mr: -1 }}>
                                        <UploadRounded />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
            )}
            {field.element === 'date' && (
                <DatePicker
                    {...field}
                    value={value || null}
                    onChange={(date) => onChange(field.name, date)}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            margin: 'normal'
                        }
                    }}
                />
            )}
            {field.element === 'quill' && (
                <Box>
                    <Typography
                        fontSize={12}
                        color={'textSecondary'}
                        ml={1.5}>
                        {field.label}
                    </Typography>
                    <ReactQuill
                        theme={'snow'}
                        value={value || ''}
                        onChange={(newValue) => onChange(field.name, newValue)}
                    />
                </Box>
            )}
        </Box>
    );
};

export default InputField;
