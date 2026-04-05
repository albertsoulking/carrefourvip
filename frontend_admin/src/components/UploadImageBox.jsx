import { useRef, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { AddRounded, DeleteRounded } from '@mui/icons-material';

export default function UploadImageBox({
    width = 120,
    height = 120,
    value,
    onChange
}) {
    const fileInputRef = useRef(null);
    const [hover, setHover] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file && file instanceof File) return;
        onChange(file); // 回传给父组件：预览URL + 文件
    };

    const handleRemove = () => {
        onChange(null); // 清除图片
    };

    return (
        <>
            {value ? (
                <Box
                    sx={{
                        position: 'relative',
                        width,
                        height,
                        minWidth: width,
                        minHeight: height,
                        maxWidth: width,
                        maxHeight: height,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid #ddd',
                        cursor: 'pointer'
                    }}>
                    {/* 图片 */}
                    <Box
                        component={'img'}
                        src={`${
                            import.meta.env.VITE_API_BASE_URL
                        }/uploads/thumbs/${value}`}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    />
                    {/* 删除按钮 */}
                    {hover && (
                        <IconButton
                            size='small'
                            sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: '#fff',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                            onMouseEnter={() => setHover(true)}>
                            <DeleteRounded fontSize='small' />
                        </IconButton>
                    )}
                </Box>
            ) : (
                <Box
                    sx={{
                        width,
                        height,
                        minWidth: width,
                        minHeight: height,
                        maxWidth: width,
                        maxHeight: height,
                        border: '2px dotted #aaa',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#888',
                        '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                    onClick={() => fileInputRef.current?.click()}>
                    <AddRounded />
                    <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/*'
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </Box>
            )}
        </>
    );
}
