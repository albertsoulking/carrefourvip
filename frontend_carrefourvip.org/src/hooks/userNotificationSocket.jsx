import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL, {
    path: '/socket.io',
    transports: ['websocket', 'polling']
});

const useNotificationSocket = (onNotification) => {
    useEffect(() => {
        // 请求通知权限
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        socket.on('connect', () => {});

        socket.on('disconnect', () => {});

        socket.on('notification', (data) => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) return;
            if (!data) return;
            if (data.userType === 'admin') return;
            if (data.userId !== user?.id) return;

            onNotification(data);
        });

        return () => {
            socket.off('notification');
        };
    }, [onNotification]);
};

export default useNotificationSocket;
