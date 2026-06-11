import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Match } from '../entities/match.entity';
import { User } from '../entities/user.entity';
import { SendMessageDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AppGateway } from '../gateway/app.gateway';
export declare class MessagesService {
    private readonly messageRepo;
    private readonly matchRepo;
    private readonly userRepo;
    private readonly notificationsService;
    private readonly gateway;
    constructor(messageRepo: Repository<Message>, matchRepo: Repository<Match>, userRepo: Repository<User>, notificationsService: NotificationsService, gateway: AppGateway);
    private verifyMatchAccess;
    send(matchId: string, senderId: string, dto: SendMessageDto): Promise<Message>;
    getChatHistory(matchId: string, userId: string, page?: number, limit?: number): Promise<{
        messages: Message[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    markAsRead(matchId: string, userId: string): Promise<void>;
    getChatList(userId: string): Promise<{
        matchId: string;
        eventId: string;
        eventTitle: string;
        otherUser: {
            id: string;
            fullName: string;
            username: string;
            avatarUrl: string;
        };
        lastMessage: {
            content: string;
            createdAt: Date;
            senderId: string;
        } | null;
        unreadCount: number;
        isSuperLike: boolean;
        matchedAt: Date;
    }[]>;
}
