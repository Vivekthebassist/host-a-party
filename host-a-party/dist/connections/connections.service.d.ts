import { Repository } from 'typeorm';
import { Swipe, SwipeDirection } from '../entities/swipe.entity';
import { Match } from '../entities/match.entity';
import { Event } from '../entities/event.entity';
import { JoinRequest } from '../entities/join-request.entity';
import { User } from '../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { AppGateway } from '../gateway/app.gateway';
export declare class ConnectionsService {
    private readonly swipeRepo;
    private readonly matchRepo;
    private readonly eventRepo;
    private readonly joinReqRepo;
    private readonly userRepo;
    private readonly notificationsService;
    private readonly gateway;
    constructor(swipeRepo: Repository<Swipe>, matchRepo: Repository<Match>, eventRepo: Repository<Event>, joinReqRepo: Repository<JoinRequest>, userRepo: Repository<User>, notificationsService: NotificationsService, gateway: AppGateway);
    swipe(swiperId: string, eventId: string, targetUserId: string, direction: SwipeDirection): Promise<{
        swipe: Swipe;
        isMatch: boolean;
        match: Match | null;
    }>;
    getSwipeCandidates(userId: string, eventId: string): Promise<User[]>;
    getEventMatches(userId: string, eventId: string): Promise<Match[]>;
    getAllMatches(userId: string): Promise<Match[]>;
}
