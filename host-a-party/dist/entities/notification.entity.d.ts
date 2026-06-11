import { User } from './user.entity';
export declare enum NotificationType {
    JOIN_REQUEST_RECEIVED = "join_request_received",
    JOIN_REQUEST_APPROVED = "join_request_approved",
    JOIN_REQUEST_REJECTED = "join_request_rejected",
    NEW_MATCH = "new_match",
    NEW_MESSAGE = "new_message",
    EVENT_GOING_LIVE = "event_going_live",
    EVENT_REMINDER = "event_reminder",
    SUPER_LIKE_RECEIVED = "super_like_received",
    CHECK_IN_AVAILABLE = "check_in_available"
}
export declare class Notification {
    id: string;
    user: User;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    metadata: Record<string, any>;
    isRead: boolean;
    createdAt: Date;
}
