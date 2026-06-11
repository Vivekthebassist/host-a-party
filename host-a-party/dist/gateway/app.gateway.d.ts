import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly userRepo;
    server: Server;
    private readonly logger;
    private readonly userSockets;
    constructor(jwtService: JwtService, userRepo: Repository<User>);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinEvent(client: Socket, data: {
        eventId: string;
    }): void;
    handleLeaveEvent(client: Socket, data: {
        eventId: string;
    }): void;
    handleJoinChat(client: Socket, data: {
        matchId: string;
    }): void;
    handleLeaveChat(client: Socket, data: {
        matchId: string;
    }): void;
    handleTyping(client: Socket, data: {
        matchId: string;
    }): void;
    emitNewMessage(matchId: string, message: any): void;
    emitMatch(userOneId: string, userTwoId: string, match: any): void;
    emitNotification(userId: string, notification: any): void;
    emitEventUpdate(eventId: string, data: any): void;
    isUserOnline(userId: string): boolean;
}
