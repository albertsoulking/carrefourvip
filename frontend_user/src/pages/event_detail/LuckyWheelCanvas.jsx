import React, { useState, useRef } from 'react';
import { LuckyWheel } from '@lucky-canvas/react';
import { Box } from '@mui/material';
import assets from '../../assets';
import api from '../../routes/api';

export default function LuckyWheelCanvas({ id, prizes, setOpen }) {
    // 开发文档 https://100px.net/docs/wheel.html

    const [blocks] = useState([{ padding: '10px', background: '#1976d2' }]);
    // const [prizes] = useState([
    //     {
    //         range: 20,
    //         background: '#e9e8fe',
    //         fonts: [
    //             {
    //                 text: '0'
    //             }
    //         ]
    //     },
    //     { range: 20, background: '#b8c5f2', fonts: [{ text: '1' }] },
    //     // { range: 20, background: '#e9e8fe', fonts: [{ text: '2' }] },
    //     // { range: 20, background: '#b8c5f2', fonts: [{ text: '3' }] },
    //     // { range: 20, background: '#e9e8fe', fonts: [{ text: '4' }] },
    //     // { range: 20, background: '#b8c5f2', fonts: [{ text: '5' }] }
    // ]);
    const [buttons] = useState([
        { radius: '40%', background: '#1976d2' },
        { radius: '35%', background: '#fff' },
        {
            radius: '30%',
            background: '#1976d2',
            pointer: true,
            fonts: [
                {
                    text: 'SPIN',
                    fontColor: '#fff',
                    fontWeight: 'bold',
                    top: '-10px'
                }
            ]
        }
    ]);
    const luckyWheel = useRef();

    return (
        <Box
            display={'flex'}
            justifyContent={'center'}
            mt={4}>
            <LuckyWheel
                ref={luckyWheel}
                width={300}
                height={300}
                blocks={blocks}
                prizes={prizes}
                buttons={buttons}
                onStart={() => {
                    luckyWheel.current.play();
                    setTimeout(async () => {
                        const res = await api.event.getResult({ id });
                        console.log(res.data);
                        luckyWheel.current.stop(
                            res.data === -1 ? undefined : res.data
                        );
                    }, 2500);
                }}
                onEnd={(prize) => {
                    setOpen({ open: true, data: prize });
                }}
            />
        </Box>
    );
}
