import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { JoinRequest } from '../entities/join-request.entity';
import { AppGateway } from '../gateway/app.gateway';
export declare class EventsSchedulerService {
    private readonly eventRepo;
    private readonly joinReqRepo;
    private readonly notificationsService;
    private readonly gateway;
    private readonly logger;
    constructor(eventRepo: Repository<Event>, joinReqRepo: Repository<JoinRequest>, notificationsService: NotificationsService, gateway: AppGateway);
    handleEventStatusTransitions(): Promise<void>;
    sendEventReminders(): Promise<void>;
}
