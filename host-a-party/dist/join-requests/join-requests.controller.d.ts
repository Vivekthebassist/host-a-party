import { JoinRequestsService } from './join-requests.service';
import { User } from '../entities/user.entity';
import { CreateJoinRequestDto, RespondJoinRequestDto } from './dto';
export declare class JoinRequestsController {
    private readonly joinReqService;
    constructor(joinReqService: JoinRequestsService);
    create(eventId: string, user: User, dto: CreateJoinRequestDto): Promise<import("../entities").JoinRequest>;
    getEventRequests(eventId: string, user: User): Promise<{
        summary: {
            pending: number;
            approved: number;
            rejected: number;
        };
        requests: import("../entities").JoinRequest[];
    }>;
    respond(id: string, user: User, dto: RespondJoinRequestDto): Promise<import("../entities").JoinRequest>;
    getMyRequests(user: User): Promise<import("../entities").JoinRequest[]>;
    cancel(id: string, user: User): Promise<void>;
}
