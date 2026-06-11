import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);
  // userId -> Set of socket IDs (user can have multiple devices)
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        client.disconnect();
        return;
      }

      (client as any).userId = user.id;

      // Track socket
      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
      }
      this.userSockets.get(user.id)!.add(client.id);

      // Auto-join user's personal room for targeted notifications
      client.join(`user:${user.id}`);

      this.logger.log(`Client connected: ${user.username} (${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) this.userSockets.delete(userId);
      }
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('join_event')
  handleJoinEvent(@ConnectedSocket() client: Socket, @MessageBody() data: { eventId: string }) {
    client.join(`event:${data.eventId}`);
    this.logger.log(`${(client as any).userId} joined event room: ${data.eventId}`);
  }

  @SubscribeMessage('leave_event')
  handleLeaveEvent(@ConnectedSocket() client: Socket, @MessageBody() data: { eventId: string }) {
    client.leave(`event:${data.eventId}`);
  }

  @SubscribeMessage('join_chat')
  handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: string }) {
    client.join(`chat:${data.matchId}`);
  }

  @SubscribeMessage('leave_chat')
  handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: string }) {
    client.leave(`chat:${data.matchId}`);
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { matchId: string }) {
    client.to(`chat:${data.matchId}`).emit('user_typing', {
      matchId: data.matchId,
      userId: (client as any).userId,
    });
  }

  // --- Server-side emit helpers (called from services) ---

  emitNewMessage(matchId: string, message: any) {
    this.server.to(`chat:${matchId}`).emit('new_message', message);
  }

  emitMatch(userOneId: string, userTwoId: string, match: any) {
    this.server.to(`user:${userOneId}`).emit('new_match', match);
    this.server.to(`user:${userTwoId}`).emit('new_match', match);
  }

  emitNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  emitEventUpdate(eventId: string, data: any) {
    this.server.to(`event:${eventId}`).emit('event_update', data);
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }
}
