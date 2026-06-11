import { User } from './user.entity';
import { Event } from './event.entity';
export declare enum JoinRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled"
}
export declare class JoinRequest {
    id: string;
    user: User;
    userId: string;
    event: Event;
    eventId: string;
    status: JoinRequestStatus;
    message: string;
    respondedBy: string;
    respondedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
