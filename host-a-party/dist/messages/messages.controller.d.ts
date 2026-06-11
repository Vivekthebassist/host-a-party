import { MessagesService } from './messages.service';
import { User } from '../entities/user.entity';
import { SendMessageDto } from './dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    getChatList(user: User): Promise<{
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
    send(matchId: string, user: User, dto: SendMessageDto): Promise<import("../entities").Message>;
    getChatHistory(matchId: string, user: User, page?: string): Promise<{
        messages: import("../entities").Message[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    markAsRead(matchId: string, user: User): Promise<void>;
}
