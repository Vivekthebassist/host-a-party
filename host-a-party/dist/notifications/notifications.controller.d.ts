import { NotificationsService } from './notifications.service';
import { User } from '../entities/user.entity';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getAll(user: User, page?: string): Promise<{
        notifications: import("../entities").Notification[];
        unreadCount: number;
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    markAsRead(id: string, user: User): Promise<void>;
    markAllAsRead(user: User): Promise<void>;
}
