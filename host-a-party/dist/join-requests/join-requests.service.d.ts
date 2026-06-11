import { Repository } from 'typeorm';
import { JoinRequest, JoinRequestStatus } from '../entities/join-request.entity';
import { Event } from '../entities/event.entity';
import { CreateJoinRequestDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class JoinRequestsService {
    private readonly joinReqRepo;
    private readonly eventRepo;
    private readonly notificationsService;
    constructor(joinReqRepo: Repository<JoinRequest>, eventRepo: Repository<Event>, notificationsService: NotificationsService);
    create(userId: string, eventId: string, dto: CreateJoinRequestDto): Promise<JoinRequest>;
    respond(requestId: string, hostId: string, status: JoinRequestStatus): Promise<JoinRequest>;
    getEventRequests(eventId: string, hostId: string): Promise<{
        summary: {
            pending: number;
            approved: number;
            rejected: number;
        };
        requests: JoinRequest[];
    }>;
    getMyRequests(userId: string): Promise<JoinRequest[]>;
    cancel(requestId: string, userId: string): Promise<void>;
}
