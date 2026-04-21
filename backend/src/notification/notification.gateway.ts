import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Notification } from './entity/notification.entity';

@WebSocketGateway({
    cors: {
        origin: [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174'
        ],
        credentials: true,
        methods: ['GET', 'POST'],
        transports: ['websocket', 'polling']
    }
})
export class NotificationGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    constructor() {
        console.log('Notification Gateway initialized!');
    }

    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log('✅ Client connected:', client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('❌ Client disconnected:', client.id);
    }

    // 推送通知
    sendNotification(noti: Notification | null) {
        this.server.emit('notification', noti);
    }
}
