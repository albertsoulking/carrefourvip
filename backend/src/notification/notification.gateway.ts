import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Notification } from './entity/notification.entity';
import * as dotenv from 'dotenv';

dotenv.config();

@WebSocketGateway({
    cors: {
        origin: (origin, callback) => {
            const allowed = process.env.CORS_ORIGINS?.split(',') || [];

            if (!origin || allowed.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
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
