import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';
import { AppGateway } from '../gateway/app.gateway';
export declare class NotificationsService {
    private readonly notifRepo;
    private readonly gateway?;
    constructor(notifRepo: Repository<Notification>, gateway?: AppGateway | undefined);
    create(userId: string, type: NotificationType, title: string, body: string, metadata?: Record<string, any>): Promise<Notification>;
    getAll(userId: string, page?: number, limit?: number): Promise<{
        notifications: Notification[];
        unreadCount: number;
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
}
